# PDCA 改善ループ — micro-apps-hub エージェント引き継ぎ書

> 作成: 2026-06-30  
> 対象: https://micro-apps-hub-seven.vercel.app  
> ユーザーストーリー全件テスト完了後の残課題を記録する

---

## PDCA-001 【High】Pro版ゲーム本体の実装

**現状**: 購入済みユーザーが `/apps/{slug}/pro` にアクセスすると、機能リスト表示とゲームページへのリンクが表示される。Pro実ゲーム（難易度解放・追加機能）は未実装。

**改善目標**: 購入済みユーザーが Pro 限定の拡張機能を実際に体験できる

**対象アプリ（優先順）**:
| slug | Pro 機能 | 実装難易度 |
|------|---------|-----------|
| tetris | レベル6〜20解放、カラーテーマ切替 | Medium |
| sudoku | 難・超難・地獄難易度、ヒント無制限 | Medium |
| math-trainer | 掛け算・割り算・分数、上級難易度 | Low |
| flashcard | カード無制限作成 UI、デッキ管理、CSV インポート | High |
| quiz-maker | クイズ作成 UI、URL シェア | High |
| haiku | テーマ指定生成、お気に入り保存 | Medium |
| bingo | 最大10枚同時、カスタム数字 | Medium |

**エージェントへの指示**:
```
各アプリの Pro 版に実際の拡張機能を実装する。
優先度: math-trainer → sudoku → tetris → haiku → bingo → flashcard → quiz-maker
各アプリで:
1. app/apps/{slug}/pro/page.tsx の購入済み分岐にゲームコンポーネントを追加
2. lib/freemium-gate.ts の dailyLimit 上限を撤廃する Pro モードフラグを追加
3. 型チェック → ビルド → デプロイ → US-033 の再テスト
```

---

## PDCA-002 【High】APPS 配列の単一ソース化

**現状**: アプリ情報が6箇所で重複定義
- `micro-apps-hub/lib/apps-config.ts` (28本)
- `micro-apps-hub/scripts/post-to-note.js` (28本)
- `micro-apps-hub/scripts/post-to-instagram.js` (28本)
- `chatwork-x-automation/src/x/post-micro-apps.ts` (28本)
- `chatwork-x-automation/src/note/post-micro-apps.ts` (28本)
- `chatwork-x-automation/src/instagram/post-micro-apps.ts` (28本)

アプリ追加のたびに6箇所を手動同期する必要があり、今回も漏れが発生した。

**改善目標**: `lib/apps-config.ts` を Single Source of Truth にし、配信スクリプトが自動参照する

**実装方針**:
```
Option A (推奨): micro-apps-hub に API エンドポイント /api/apps を追加し、
  配信スクリプトが本番 API を fetch してアプリ一覧を取得する。
  chatwork-x-automation/src/x/post-micro-apps.ts が
    const apps = await fetch('https://micro-apps-hub-seven.vercel.app/api/apps').then(r=>r.json())
  のように呼ぶ。

Option B: apps-config.ts を npm パッケージ化して両リポジトリで共有する。
```

**エージェントへの指示**:
```
1. app/api/apps/route.ts を作成（GET: APPS 配列を JSON で返す、キャッシュ1時間）
2. chatwork-x-automation の post-micro-apps.ts(×3) を API fetch に変更
3. 配信スクリプトの dry-run で全28アプリが取得できることを確認
```

---

## PDCA-003 【Medium】認証フローの E2E テスト自動化

**現状**: US-005〜007, US-017, US-020, US-025 が BLOCKED（手動確認が必要）

**改善目標**: Playwright で E2E テストを自動化し、CI で毎回実行する

**実装方針**:
```
playwright.config.ts を作成し、以下をテスト:
- サインアップ → メール確認フロー (Supabase のメールプレビュー機能 or テストアカウント使用)
- ログイン → Pro ページアクセス → 購入画面確認
- Stripe CLI でローカル Webhook テスト
```

**エージェントへの指示**:
```
1. npm install -D @playwright/test
2. e2e/auth.spec.ts: サインアップ・ログインのハッピーパスとエラーパス
3. e2e/purchase.spec.ts: Stripe テストカードを使った購入フロー
4. GitHub Actions の workflow に e2e ジョブを追加
5. docs/user-stories.csv の BLOCKED 項目を PASS に更新
```

---

## PDCA-004 【Medium】トップページの動的アプリ数表示

**現状**: アプリ数が `app/page.tsx` と `app/layout.tsx` にハードコード（「28本」）。アプリ追加のたびに手動更新が必要。

**改善目標**: `APPS.length` を参照して自動的に正確な数を表示する

**修正箇所**:
```tsx
// app/page.tsx (Hero バッジ)
🎮 {APPS.length}本のミニアプリ集

// app/page.tsx (本文)
テトリス・将棋・脳トレなど全{APPS.length}本。

// app/page.tsx (統計)
{ label: 'アプリ数', value: `${APPS.length}本` }
```

**注意**: `app/layout.tsx` の metadata はサーバー側 static で APPS import できるが、
SEO用 title/description は定期的な手動更新でも許容範囲。

---

## PDCA-005 【Low】TimesFM HF Spaces デプロイ

**現状**: `timesfm-server/` コードは完成済みだが HF へのデプロイが手動作業のため保留。
`/api/predict` は線形回帰フォールバックで動作中。

**改善目標**: TimesFM 2.5 (200M) モデルで精度の高いスコア予測を提供する

**手順** (手動操作が必要):
```bash
hf auth login  # HF Token でログイン
bash timesfm-server/deploy-to-hf.sh hiroshi57
vercel env add TIMESFM_API_URL production  # HF Spaces URL を設定
```

---

## テスト結果サマリー (2026-06-30)

| 状態 | 件数 | 割合 |
|------|------|------|
| PASS | 23 | 68% |
| BLOCKED (手動確認必要) | 6 | 18% |
| PDCA (継続改善) | 1 | 3% |
| 修正完了 | 4 | 12% |
| **合計** | **34** | **100%** |

**修正済みバグ**:
- US-001/032: アプリ数表記の不統一（3箇所+metadata）→ 28本に統一 (commit 4e8b09d, d1bf333)
- US-013: 新規4アプリが FreemiumGate 未登録 → GAME_FREEMIUM_CONFIGS に追加 (commit 4e8b09d)
- US-019: tetris Pro ページのスタブ表示 → 機能リスト+プレイボタンに修正 (commit 4e8b09d)
- (bonus) tetris/pro の CheckoutButton が form-action 方式（JSON body 非対応）→ 共通コンポーネントに統一
