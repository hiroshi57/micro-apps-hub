# MicroApps Hub 🎮

> 24本の小さなアプリ集。無料でプレイして、ハマったら Pro へ。

**🌐 本番URL**: https://hermesagentdashboard.vercel.app

---

## アプリ一覧（24本）

### 🎮 ゲーム系
| アプリ | 無料 | Pro価格 |
|-------|------|---------|
| 🧱 テトリス | Lv.1-5 | ¥480 |
| 🔢 数独 | 易・普通 | ¥480 |
| 💣 マインスイーパー | 初級 | ¥380 |
| 🔀 2048 | 4×4 | ¥380 |
| 🐍 スネーク | スタンダード | ¥380 |
| 🏓 ブロック崩し | 10ステージ | ¥480 |
| 🃏 記憶カード | 6ペア | ¥380 |
| 🔲 スライドパズル | 3×3・4×4 | ¥380 |
| ✂️ じゃんけんAI | ランダムAI | ¥480 |
| ♟️ 将棋 | 初級AI | ¥780 |
| ♛ チェス | 初級AI | ¥780 |
| ⚫ オセロ | 初級AI | ¥480 |

### 🧠 トレーニング系
| アプリ | 無料 | Pro価格 |
|-------|------|---------|
| ⌨️ タイピング練習 | ひらがな基本 | ¥580 |
| ⚡ 反応速度テスト | シンプルテスト | ¥380 |
| 🎨 色彩テスト | 基本3ラウンド | ¥480 |
| 🧮 計算力トレーナー | 足し算・引き算 | ¥480 |
| 🀄 漢字クイズ | N5・N4 | ¥680 |
| 🧠 シニア向け脳トレ | 1日5問 | ¥680 |

### 🌿 ウェルネス・ツール系
| アプリ | 無料 | Pro価格 |
|-------|------|---------|
| 🍅 ポモドーロ | 基本タイマー | ¥580 |
| 🌬️ 呼吸瞑想 | 4-7-8呼吸法 | ¥580 |
| 💭 名言ジェネレーター | 1日1名言 | ¥380 |
| 🎧 作業用BGM | 2種類の音 | ¥680 |
| 🎨 カラーパレット | 5色生成 | ¥580 |
| 📅 時間割メーカー | 5色・PNG3回 | ¥580 |

---

## フリーミアムモデル

**Flow → Hook → Pro壁**戦略:

1. **無料で体験** — 数回プレイして面白さを実感
2. **フロー状態へ** — FlowEngine が自動難易度調整（成功率65-80%を維持）
3. **ゾーン突入** — 5連続正解で⚡ゾーン（XP×2倍・エフェクト）
4. **Pro壁** — ストリーク最高潮のタイミングで購入モーダル表示
5. **買い切り** — サブスクなし・永久利用

---

## 技術スタック

| 項目 | 技術 |
|-----|------|
| フレームワーク | Next.js 15.3.9 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| 認証 | Supabase Auth (SSR) |
| DB | Supabase (PostgreSQL + RLS) |
| 決済 | Stripe Checkout (買い切り) |
| デプロイ | Vercel (hnd1リージョン) |
| 自動投稿 | GitHub Actions + X API (毎日8:30 JST) |

---

## 学習機能 & AI予測

### FlowEngine (`lib/flow-engine.ts`)
- 適応難易度調整（成功率65-80%に自動収束）
- ストリーク・コンボ・ゾーンシステム
- XP・ランク・フック心理メッセージ

### TimesFM 予測 (`/api/predict`)
- [Google TimesFM](https://github.com/google-research/timesfm) でスコア予測
- 環境変数 `TIMESFM_API_URL` 設定で有効化
- フォールバック: 加重線形回帰

```bash
# TimesFM セットアップ
git clone https://github.com/google-research/timesfm.git
cd timesfm && pip install -e ".[pax]"
# Python APIサーバーを起動し TIMESFM_API_URL を設定
```

---

## セットアップ

```bash
# 1. 依存関係インストール
npm install --legacy-peer-deps

# 2. 環境変数設定
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, STRIPE_SECRET_KEY を設定

# 3. Supabase スキーマ実行
# supabase/schema.sql をダッシュボードで実行

# 4. Stripe Price ID 作成
STRIPE_SECRET_KEY=sk_live_xxx node scripts/create-stripe-prices.js

# 5. 開発サーバー起動
npm run dev
```

---

## デプロイ

```bash
vercel deploy --prod --scope takizawahiroshi-gmailcoms-projects
```

---

*Built with Claude Code + Shogun Multi-Agent System*
