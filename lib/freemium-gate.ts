/**
 * lib/freemium-gate.ts
 *
 * 全ゲーム共通フリーミアムゲート
 *
 * 戦略: 「Flow → Hook → Pro壁」
 *   1. 最初の数プレイは完全無料 → フロー状態に誘導
 *   2. ストリーク中・レベルアップ直後 = 最高のPro壁タイミング
 *   3. Pro壁は「あと1問」の心理を使って購買動機を最大化
 *
 * デフォルト上限: 5回/日（ゲームごとに設定可能）
 */

const GATE_KEY = 'freemium-gate-v1';

export interface FreemiumConfig {
  slug: string;
  dailyLimit: number;      // 1日のプレイ上限（デフォルト: 5）
  totalFreeLimit?: number; // 生涯無料プレイ上限（設定時は日次より優先）
  proPath: string;         // Pro 購入ページパス
}

export interface GateState {
  slug: string;
  todayCount: number;
  totalCount: number;
  lastDate: string;        // YYYY-MM-DD
  firstPlayedAt: string;   // ISO8601
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadGateState(slug: string): GateState {
  try {
    const all = JSON.parse(localStorage.getItem(GATE_KEY) || '{}');
    const saved = all[slug];
    if (!saved) return createDefault(slug);

    // 日付が変わっていたらリセット
    if (saved.lastDate !== todayStr()) {
      saved.todayCount = 0;
      saved.lastDate = todayStr();
    }
    return saved;
  } catch {
    return createDefault(slug);
  }
}

function saveGateState(state: GateState) {
  try {
    const all = JSON.parse(localStorage.getItem(GATE_KEY) || '{}');
    all[state.slug] = state;
    localStorage.setItem(GATE_KEY, JSON.stringify(all));
  } catch {}
}

function createDefault(slug: string): GateState {
  return {
    slug,
    todayCount: 0,
    totalCount: 0,
    lastDate: todayStr(),
    firstPlayedAt: new Date().toISOString(),
  };
}

// ==============================
// FreemiumGate クラス
// ==============================

export class FreemiumGate {
  private config: FreemiumConfig;
  private state: GateState;

  constructor(config: FreemiumConfig) {
    this.config = config.dailyLimit ? config : { ...config, dailyLimit: 5 };
    this.state = loadGateState(config.slug);
  }

  /** まだプレイできるか？ */
  canPlay(): boolean {
    if (this.config.totalFreeLimit !== undefined) {
      return this.state.totalCount < this.config.totalFreeLimit;
    }
    return this.state.todayCount < this.config.dailyLimit;
  }

  /** 残りプレイ回数 */
  remaining(): number {
    if (this.config.totalFreeLimit !== undefined) {
      return Math.max(0, this.config.totalFreeLimit - this.state.totalCount);
    }
    return Math.max(0, this.config.dailyLimit - this.state.todayCount);
  }

  /** プレイ開始を記録（ゲーム開始時に呼ぶ） */
  recordPlay() {
    this.state.todayCount++;
    this.state.totalCount++;
    saveGateState(this.state);
  }

  /** Pro壁メッセージ（最適なタイミングで表示） */
  proWallMessage(streak: number, level: number): ProWallContext {
    const { slug, proPath, dailyLimit } = this.config;
    const remaining = this.remaining();

    if (streak >= 5) {
      return {
        headline: `🔥 ${streak}連続正解！ここからがProの真骨頂`,
        subtext: 'Pro版でこの集中力を最大限に活かせます',
        urgency: 'high',
        slug,
        proPath,
        remaining,
        dailyLimit,
      };
    }

    if (level >= 5) {
      return {
        headline: `⬆️ レベル${level}到達！次は上位レベルへ`,
        subtext: 'Pro版でさらに高いレベルに挑戦できます',
        urgency: 'medium',
        slug,
        proPath,
        remaining,
        dailyLimit,
      };
    }

    return {
      headline: '🎯 本日の無料プレイ終了',
      subtext: 'Pro版で明日も今日の続きから始められます',
      urgency: 'normal',
      slug,
      proPath,
      remaining,
      dailyLimit,
    };
  }

  get currentState(): GateState {
    return { ...this.state };
  }
}

export interface ProWallContext {
  headline: string;
  subtext: string;
  urgency: 'high' | 'medium' | 'normal';
  slug: string;
  proPath: string;
  remaining: number;
  dailyLimit: number;
}

// ==============================
// ゲーム別設定マップ
// ==============================

/**
 * 各ゲームのフリーミアム設定
 * dailyLimit を低く設定するほど早くPro壁に当たる
 */
export const GAME_FREEMIUM_CONFIGS: Record<string, Omit<FreemiumConfig, 'slug'>> = {
  tetris:             { dailyLimit: 5, proPath: '/apps/tetris/pro' },
  sudoku:             { dailyLimit: 3, proPath: '/apps/sudoku/pro' },
  minesweeper:        { dailyLimit: 5, proPath: '/apps/minesweeper/pro' },
  '2048':             { dailyLimit: 5, proPath: '/apps/2048/pro' },
  snake:              { dailyLimit: 5, proPath: '/apps/snake/pro' },
  'memory-card':      { dailyLimit: 3, proPath: '/apps/memory-card/pro' },
  breakout:           { dailyLimit: 5, proPath: '/apps/breakout/pro' },
  'slide-puzzle':     { dailyLimit: 5, proPath: '/apps/slide-puzzle/pro' },
  'rock-paper-scissors': { dailyLimit: 10, proPath: '/apps/rock-paper-scissors/pro' },
  typing:             { dailyLimit: 3, proPath: '/apps/typing/pro' },
  pomodoro:           { dailyLimit: 3, proPath: '/apps/pomodoro/pro' },
  breathing:          { dailyLimit: 5, proPath: '/apps/breathing/pro' },
  reaction:           { dailyLimit: 5, proPath: '/apps/reaction/pro' },
  'color-test':       { dailyLimit: 3, proPath: '/apps/color-test/pro' },
  'math-trainer':     { dailyLimit: 5, proPath: '/apps/math-trainer/pro' },
  'kanji-quiz':       { dailyLimit: 5, proPath: '/apps/kanji-quiz/pro' },
  quote:              { dailyLimit: 5, proPath: '/apps/quote/pro' },
  noise:              { dailyLimit: 3, proPath: '/apps/noise/pro' },
  'color-palette':    { dailyLimit: 5, proPath: '/apps/color-palette/pro' },
  schedule:           { dailyLimit: 3, proPath: '/apps/schedule/pro' },
  shogi:              { dailyLimit: 3, proPath: '/apps/shogi/pro' },
  chess:              { dailyLimit: 3, proPath: '/apps/chess/pro' },
  othello:            { dailyLimit: 5, proPath: '/apps/othello/pro' },
  'senior-brain':     { dailyLimit: 5,  proPath: '/apps/senior-brain/pro' },
  // 2026-06-29 追加の4アプリ
  flashcard:          { dailyLimit: 5,  proPath: '/apps/flashcard/pro' },
  'quiz-maker':       { dailyLimit: 5,  proPath: '/apps/quiz-maker/pro' },
  haiku:              { dailyLimit: 3,  proPath: '/apps/haiku/pro' },
  bingo:              { dailyLimit: 5,  proPath: '/apps/bingo/pro' },
};

/** ゲームの FreemiumGate インスタンスを取得 */
export function getFreemiumGate(slug: string): FreemiumGate {
  const config = GAME_FREEMIUM_CONFIGS[slug] ?? { dailyLimit: 5, proPath: `/apps/${slug}/pro` };
  return new FreemiumGate({ slug, ...config });
}
