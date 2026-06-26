/**
 * lib/flow-engine.ts
 *
 * 「フロー状態エンジン」— 抜け出せない仕組みを作る
 *
 * コンセプト: Csikszentmihalyi のフロー理論
 *   - スキル ≈ 難易度 の時に「没入」が起きる
 *   - 成功率 65-80% が最もハマる（易すぎず難しすぎず）
 *   - 連続正解で「ゾーン」に入り、一問だけ…が永遠に続く
 *
 * フックモデル (Nir Eyal):
 *   1. Trigger(きっかけ) → 2. Action(行動) → 3. Reward(報酬) → 4. Investment(投資)
 */

const FLOW_KEY = 'flow-state-v1';

// ==============================
// 型定義
// ==============================

export interface FlowSession {
  slug: string;
  level: number;            // 現在の難易度 (1-20)
  xp: number;               // 経験値
  streak: number;           // 現在の連続正解数
  maxStreak: number;        // 最高連続正解数
  combo: number;            // コンボ倍率 (1x, 2x, 3x...)
  totalCorrect: number;
  totalWrong: number;
  lastPlayedAt: string;
  zone: boolean;            // フロー状態(ゾーン)フラグ
  levelHistory: number[];   // 過去のレベル推移
}

export interface RewardEvent {
  type: 'combo' | 'levelup' | 'zone_enter' | 'streak_bonus' | 'near_miss' | 'comeback';
  message: string;
  xpBonus: number;
  emoji: string;
}

export interface DifficultyResult {
  nextLevel: number;
  reason: string;
  successRate: number;
}

// ==============================
// XP テーブル
// ==============================

const BASE_XP: Record<string, number> = {
  correct: 10,
  streak3: 5,    // 3連続ボーナス
  streak5: 15,   // 5連続ボーナス
  streak10: 50,  // 10連続ボーナス
  levelup: 30,
  zone: 20,      // ゾーン中は毎問+20
};

// ==============================
// セッション管理
// ==============================

function loadSession(slug: string): FlowSession {
  try {
    const all = JSON.parse(localStorage.getItem(FLOW_KEY) || '{}');
    return all[slug] ?? createDefaultSession(slug);
  } catch {
    return createDefaultSession(slug);
  }
}

function saveSession(session: FlowSession) {
  try {
    const all = JSON.parse(localStorage.getItem(FLOW_KEY) || '{}');
    all[session.slug] = session;
    localStorage.setItem(FLOW_KEY, JSON.stringify(all));
  } catch {}
}

function createDefaultSession(slug: string): FlowSession {
  return {
    slug,
    level: 1,
    xp: 0,
    streak: 0,
    maxStreak: 0,
    combo: 1,
    totalCorrect: 0,
    totalWrong: 0,
    lastPlayedAt: new Date().toISOString(),
    zone: false,
    levelHistory: [1],
  };
}

// ==============================
// FlowEngine クラス
// ==============================

export class FlowEngine {
  private session: FlowSession;

  constructor(slug: string) {
    this.session = loadSession(slug);
  }

  get state(): FlowSession {
    return { ...this.session };
  }

  /** 正解時に呼ぶ → RewardEvent[] を返す */
  onCorrect(): RewardEvent[] {
    const events: RewardEvent[] = [];
    const s = this.session;

    s.totalCorrect++;
    s.streak++;
    s.maxStreak = Math.max(s.maxStreak, s.streak);

    // コンボ計算
    s.combo = Math.min(8, 1 + Math.floor(s.streak / 3));

    // XP 付与
    let xp = BASE_XP.correct * s.combo;

    // ゾーン中ボーナス
    if (s.zone) {
      xp += BASE_XP.zone;
      events.push({ type: 'zone_enter', message: 'ゾーン継続中！', xpBonus: BASE_XP.zone, emoji: '⚡' });
    }

    // 連続正解ボーナス
    if (s.streak === 3) {
      xp += BASE_XP.streak3;
      events.push({ type: 'streak_bonus', message: '3連続正解！', xpBonus: BASE_XP.streak3, emoji: '🔥' });
    } else if (s.streak === 5) {
      xp += BASE_XP.streak5;
      events.push({ type: 'streak_bonus', message: '5連続！ゾーン突入！', xpBonus: BASE_XP.streak5, emoji: '⚡' });
      s.zone = true;
    } else if (s.streak === 10) {
      xp += BASE_XP.streak10;
      events.push({ type: 'streak_bonus', message: '10連続！伝説！', xpBonus: BASE_XP.streak10, emoji: '🌟' });
    } else if (s.streak > 0 && s.streak % 5 === 0) {
      events.push({ type: 'combo', message: `${s.streak}連続！${s.combo}xコンボ！`, xpBonus: s.combo * 5, emoji: '🎯' });
    }

    s.xp += xp;

    // レベルアップ判定
    const diff = this.adjustDifficulty();
    if (diff.nextLevel > s.level) {
      events.push({
        type: 'levelup',
        message: `レベル${diff.nextLevel}に上がった！`,
        xpBonus: BASE_XP.levelup,
        emoji: '⬆️',
      });
      s.xp += BASE_XP.levelup;
      s.level = diff.nextLevel;
      s.levelHistory.push(diff.nextLevel);
    }

    s.lastPlayedAt = new Date().toISOString();
    saveSession(s);
    return events;
  }

  /** 不正解時に呼ぶ */
  onWrong(): RewardEvent[] {
    const events: RewardEvent[] = [];
    const s = this.session;

    s.totalWrong++;

    // ニアミス演出（3連続正解中に間違えた）
    if (s.streak >= 3) {
      events.push({
        type: 'near_miss',
        message: `惜しい！${s.streak}連続で止まった…もう一度！`,
        xpBonus: 0,
        emoji: '😤',
      });
    }

    // カムバック演出（5連続不正解後の正解への期待を煽る）
    if (s.totalWrong >= 2 && s.streak === 0) {
      events.push({
        type: 'comeback',
        message: '次は絶対正解できる！',
        xpBonus: 0,
        emoji: '💪',
      });
    }

    // ゾーン解除
    if (s.streak < 5) s.zone = false;

    // ストリーク・コンボリセット
    const oldStreak = s.streak;
    s.streak = 0;
    s.combo = 1;

    // XP は少しだけ付与（ペナルティなし → 離脱防止）
    s.xp += 2;

    // レベルダウン判定（緩やか）
    const diff = this.adjustDifficulty();
    if (diff.nextLevel < s.level && oldStreak === 0) {
      // 2連続不正解でのみレベルダウン
      s.level = diff.nextLevel;
      s.levelHistory.push(diff.nextLevel);
    }

    s.lastPlayedAt = new Date().toISOString();
    saveSession(s);
    return events;
  }

  /**
   * 適応難易度調整
   * 成功率 65-80% のゾーンに収める → 最もハマる難易度
   */
  adjustDifficulty(): DifficultyResult {
    const s = this.session;
    const total = s.totalCorrect + s.totalWrong;
    if (total < 3) return { nextLevel: s.level, reason: 'データ不足', successRate: 1 };

    const successRate = s.totalCorrect / total;

    if (successRate > 0.85 && s.streak >= 3) {
      // 成功率高すぎ → レベルアップ
      return {
        nextLevel: Math.min(20, s.level + 1),
        reason: `成功率${Math.round(successRate * 100)}% — 難易度UP`,
        successRate,
      };
    }

    if (successRate < 0.45 && s.streak === 0) {
      // 失敗しすぎ → レベルダウン（離脱防止）
      return {
        nextLevel: Math.max(1, s.level - 1),
        reason: `成功率${Math.round(successRate * 100)}% — 難易度DOWN`,
        successRate,
      };
    }

    return {
      nextLevel: s.level,
      reason: `成功率${Math.round(successRate * 100)}% — フロー維持`,
      successRate,
    };
  }

  /** 「あと1問」を誘う心理メッセージ */
  getHookMessage(): string {
    const s = this.session;

    if (s.streak >= 9) return '🌟 あと1問で伝説の10連続！';
    if (s.streak >= 4) return '⚡ ゾーン突入まであと1問！';
    if (s.streak >= 2) return `🔥 ${s.streak}連続中！この調子！`;
    if (s.zone) return '⚡ ゾーン状態！集中力MAX！';
    if (s.combo > 3) return `🎯 ${s.combo}xコンボ継続中！`;

    const xpToNext = getXpToNextLevel(s.xp);
    if (xpToNext < 50) return `⬆️ あと${xpToNext}XPでレベルアップ！`;

    const motivations = [
      'もう1問だけ…',
      'まだいける！',
      '次は絶対正解！',
      '記録更新まであと少し！',
      '集中力が上がってきた！',
    ];
    return motivations[Math.floor(Date.now() / 10000) % motivations.length];
  }

  /** 全データリセット（テスト用） */
  reset() {
    this.session = createDefaultSession(this.session.slug);
    saveSession(this.session);
  }
}

// ==============================
// XPレベルシステム
// ==============================

/** XP → プレイヤーレベル */
export function getPlayerLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/** 次のレベルまでの残りXP */
export function getXpToNextLevel(xp: number): number {
  const current = getPlayerLevel(xp);
  const nextLevelXp = (current) ** 2 * 50;
  return nextLevelXp - xp;
}

/** プレイヤーランク名 */
export function getRankName(xp: number): string {
  const level = getPlayerLevel(xp);
  if (level >= 50) return '🏆 殿堂入り';
  if (level >= 30) return '💎 ダイヤモンド';
  if (level >= 20) return '🥇 ゴールド';
  if (level >= 10) return '🥈 シルバー';
  if (level >= 5) return '🥉 ブロンズ';
  return '🌱 ビギナー';
}

// ==============================
// 全ゲームの FlowEngine を取得
// ==============================

/** シングルトンで FlowEngine を取得（React Hook 用） */
const engines: Record<string, FlowEngine> = {};
export function getFlowEngine(slug: string): FlowEngine {
  if (!engines[slug]) engines[slug] = new FlowEngine(slug);
  return engines[slug];
}
