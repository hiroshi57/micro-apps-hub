# MicroApps Hub — 将軍ダッシュボード

> 更新: 2026-06-26

## 🚨 要対応（殿へ）
- なし

## 📊 全体進捗

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 | アプリページ実装 (24本) | ✅ 完了 |
| Phase 2 | Pro ページ 22本実装 | 🔄 Shogun並列処理中 |
| Phase 3 | 学習機能・フローエンジン | ✅ インフラ完了 |
| Phase 4 | TimesFM 予測API | ✅ エンドポイント作成 |
| Phase 5 | 共通化・GitHub・最終デプロイ | ⏸ Phase2完了待ち |

## 足軽 状態

| 足軽 | タスク | 状態 |
|-----|--------|------|
| 足軽1 | color-test / schedule / senior-brain学習機能 | 📋 指示更新済み |
| 足軽2 | Pro A群 + 学習機能統合 | 📋 指示更新済み |
| 足軽3 | Pro B群 (5本) | ⏳ 待機中 |
| 足軽4 | Pro C群 (5本) | ⏳ 待機中 |
| 足軽5 | Pro D群 (6本) | ⏳ 待機中 |
| 足軽6 | 共通化・学習DB・GitHub・デプロイ | ⏸ Phase2完了待ち |

## 実装済み（本セッション完了）

### アプリ
- ✅ 全21本 無料版ページ（既存）
- ✅ **シニア向け脳トレ（新規）** — 無料版（1日5問）+ Pro版
- ✅ tetris/pro ページ

### 学習機能インフラ
- ✅ `lib/learning.ts` — 全ゲーム共通プレイ記録・統計
- ✅ `lib/flow-engine.ts` — フロー状態エンジン（連続正解・ゾーン突入・XPシステム）
- ✅ `lib/freemium-gate.ts` — 全ゲームのFreemium設定（dailyLimit管理）
- ✅ `app/components/ProWallModal.tsx` — Pro壁モーダル・ScorePopup・FlowIndicator
- ✅ `app/api/predict/route.ts` — TimesFM予測API（フォールバック: 線形回帰）
- ✅ `app/apps/tetris/page.tsx` — FlowEngine統合済み（参照実装）

### TimesFM 統合
- ✅ `/api/predict` エンドポイント作成
- 環境変数 `TIMESFM_API_URL` を設定すれば自動切換え
- 未設定時は加重線形回帰で代替

## フローエンジン仕様

### 「抜け出せない仕組み」
1. 正解率65-80%に自動調整 → フロー状態を維持
2. 3連続正解 → 🔥 ストリークボーナス
3. 5連続正解 → ⚡ ゾーン突入（ボーナスXP2倍）
4. 10連続正解 → 🌟 伝説（大量XP）
5. 失敗時 → 「次は絶対正解できる！」メッセージ（離脱防止）
6. フック: 「あと1問でレベルアップ！」

### 「数回やったら有料版」
| ゲーム | 無料回数/日 |
|--------|------------|
| shogi/chess | 3回 |
| sudoku/memory-card/typing | 3回 |
| tetris/snake/breakout | 5回 |
| senior-brain | 5問/日 |

## Vercel URL
https://micro-apps-2jque7wkt-takizawahiroshi-gmailcoms-projects.vercel.app

## TimesFM セットアップ（オプション）
```bash
git clone https://github.com/google-research/timesfm.git
cd timesfm && pip install -e ".[pax]"
# Python API サーバー起動後
vercel env add TIMESFM_API_URL
```
