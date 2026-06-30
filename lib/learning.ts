/**
 * lib/learning.ts
 * 全ゲーム共通の学習機能ライブラリ
 *
 * - ゲームごとのプレイ記録をローカルストレージに保存（無料版）
 * - Pro版: Supabase に同期（将来拡張）
 * - TimesFM 予測API へのインターフェース
 */

export interface GameRecord {
  slug: string;       // ゲームスラグ
  playedAt: string;   // ISO8601
  score: number;      // スコア（ゲームごとに正規化 0-100）
  level: number;      // 難易度レベル（1-10）
  duration: number;   // プレイ時間（秒）
  correct?: number;   // 正解数（脳トレ系）
  total?: number;     // 出題数
}

export interface LearningStats {
  slug: string;
  totalPlays: number;
  avgScore: number;
  bestScore: number;
  currentLevel: number;
  streak: number;           // 連続プレイ日数
  lastPlayed: string | null;
  trend: 'improving' | 'stable' | 'declining' | 'new';
  weeklyScores: number[];   // 直近7回のスコア
}

const STORAGE_KEY = 'micro-apps-learning-v1';

// ==============================
// ストレージ操作
// ==============================

function loadAllRecords(): GameRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAllRecords(records: GameRecord[]) {
  // 直近1000件まで保持
  const trimmed = records.slice(-1000);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

// ==============================
// プレイ記録
// ==============================

/**
 * ゲーム結果を記録する
 * 全ゲームのゲーム終了時に呼ぶ
 *
 * - 無料版: localStorage に保存
 * - Pro版（ログイン中）: Supabase `learning_records` にも同期（fire-and-forget）
 */
export function recordGameResult(record: Omit<GameRecord, 'playedAt'>) {
  const playedAt = new Date().toISOString();
  const records = loadAllRecords();
  records.push({ ...record, playedAt });
  saveAllRecords(records);

  // ログイン中ならサーバーにも同期（失敗しても localStorage 記録は残る）
  void syncRecordToCloud({ ...record, playedAt });
}

/**
 * ログイン中のユーザーの場合のみ学習記録を Supabase に同期する。
 * 未ログイン・ネットワーク失敗時は静かに諦める（localStorage が真実の源）。
 */
export async function syncRecordToCloud(record: GameRecord): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return; // 無料版 / 未ログインはスキップ

    await fetch('/api/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch {
    // 同期失敗は無視（次回プレイ時に再送はしないが localStorage には残る）
  }
}

/**
 * サーバーに保存済みの学習記録を取得する（Pro 向け統計表示用）。
 * 未ログイン時は null を返す。
 */
export async function fetchCloudRecords(slug?: string): Promise<GameRecord[] | null> {
  if (typeof window === 'undefined') return null;

  try {
    const url = slug ? `/api/learning?slug=${encodeURIComponent(slug)}` : '/api/learning';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      records: Array<{
        app_slug: string;
        score: number;
        level: number;
        duration: number;
        correct: number | null;
        total: number | null;
        played_at: string;
      }>;
    };
    return data.records.map((r) => ({
      slug: r.app_slug,
      score: r.score,
      level: r.level,
      duration: r.duration,
      correct: r.correct ?? undefined,
      total: r.total ?? undefined,
      playedAt: r.played_at,
    }));
  } catch {
    return null;
  }
}

// ==============================
// 統計取得
// ==============================

/** 指定スラグの学習統計を返す */
export function getLearningStats(slug: string): LearningStats {
  const records = loadAllRecords().filter(r => r.slug === slug);

  if (records.length === 0) {
    return {
      slug,
      totalPlays: 0,
      avgScore: 0,
      bestScore: 0,
      currentLevel: 1,
      streak: 0,
      lastPlayed: null,
      trend: 'new',
      weeklyScores: [],
    };
  }

  const scores = records.map(r => r.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const currentLevel = records[records.length - 1].level;
  const weeklyScores = scores.slice(-7);

  // トレンド判定（直近5回 vs 前5回）
  let trend: LearningStats['trend'] = 'stable';
  if (records.length >= 6) {
    const recent = scores.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const prev = scores.slice(-10, -5).reduce((a, b) => a + b, 0) / Math.min(5, scores.slice(-10, -5).length);
    if (recent > prev + 5) trend = 'improving';
    else if (recent < prev - 5) trend = 'declining';
  } else if (records.length >= 2) {
    trend = 'stable';
  }

  // 連続日数
  const streak = calcStreak(records.map(r => r.playedAt));

  return {
    slug,
    totalPlays: records.length,
    avgScore,
    bestScore,
    currentLevel,
    streak,
    lastPlayed: records[records.length - 1].playedAt,
    trend,
    weeklyScores,
  };
}

/** 全アプリの統計サマリー */
export function getAllStats(): LearningStats[] {
  const records = loadAllRecords();
  const slugs = [...new Set(records.map(r => r.slug))];
  return slugs.map(s => getLearningStats(s));
}

// ==============================
// 難易度自動調整
// ==============================

/**
 * 次の難易度を推薦する（直近3回の平均スコアから）
 * @returns 1-10 の難易度レベル
 */
export function recommendNextLevel(slug: string, currentLevel: number): number {
  const records = loadAllRecords()
    .filter(r => r.slug === slug)
    .slice(-3);

  if (records.length < 2) return currentLevel;

  const recentAvg = records.reduce((a, r) => a + r.score, 0) / records.length;

  if (recentAvg >= 85 && currentLevel < 10) return currentLevel + 1;
  if (recentAvg <= 40 && currentLevel > 1) return currentLevel - 1;
  return currentLevel;
}

// ==============================
// TimesFM 予測インターフェース
// ==============================

export interface PredictionResult {
  forecast: number[];         // 予測スコア（次7回分）
  trend: 'up' | 'down' | 'flat';
  confidence: number;         // 信頼度 0-1
  reachGoalIn?: number;       // 目標スコア80に到達するまでの予測回数
  model: 'timesfm' | 'linear'; // 使用モデル
}

/**
 * TimesFM API を使ってスコア予測を取得する
 * /api/predict エンドポイント経由
 */
export async function fetchPrediction(slug: string): Promise<PredictionResult | null> {
  const records = loadAllRecords()
    .filter(r => r.slug === slug)
    .slice(-30); // TimesFM は30ポイントあると精度UP

  if (records.length < 5) return null;

  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        scores: records.map(r => r.score),
        timestamps: records.map(r => r.playedAt),
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // フォールバック: 線形回帰
    return linearFallback(records.map(r => r.score));
  }
}

// ==============================
// ユーティリティ
// ==============================

function calcStreak(isoDateStrings: string[]): number {
  const dates = [...new Set(isoDateStrings.map(d => d.slice(0, 10)))].sort().reverse();
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let check = today;

  for (const date of dates) {
    if (date === check) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().slice(0, 10);
    } else if (date < check) {
      break;
    }
  }
  return streak;
}

function linearFallback(scores: number[]): PredictionResult {
  const n = scores.length;
  const x = scores.map((_, i) => i);
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = scores.reduce((a, b) => a + b, 0) / n;
  const slope = x.reduce((acc, xi, i) => acc + (xi - meanX) * (scores[i] - meanY), 0) /
    x.reduce((acc, xi) => acc + (xi - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;

  const forecast = Array.from({ length: 7 }, (_, i) =>
    Math.min(100, Math.max(0, Math.round(intercept + slope * (n + i))))
  );

  const trend = slope > 1 ? 'up' : slope < -1 ? 'down' : 'flat';
  const reachGoalIn = slope > 0 ? Math.ceil((80 - meanY) / slope) : undefined;

  return { forecast, trend, confidence: 0.6, reachGoalIn, model: 'linear' };
}
