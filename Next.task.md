# Next.task.md — micro-apps-hub 今後のタスク

> 更新日: 2026-06-29

---

## ✅ 完了済み

| タスク | 詳細 |
|--------|------|
| 24本アプリ実装 | テトリス〜シニア脳トレまで全Pro ページ付き |
| FlowEngine | 難易度自動調整（65-80%成功率維持）・XP・ゾーン |
| FreemiumGate | ゲームごとの無料プレイ回数制限（localStorage）|
| ProWallModal | 最高集中点でPro壁を表示する共通コンポーネント |
| Stripe決済 | 24アプリ分のPrice ID作成・Webhook設定済み |
| Supabase Auth | site_url・redirect_urls設定済み (vvascrjcjosbtcrlbakt) |
| learning_records | Pro向けサーバーサイド学習データテーブル |
| TimesFMサーバー v2 | TimesFM 2.5(200M)対応・deploy-to-hf.sh完成（HFアカウントでの実行待ち）|
| OGP 画像自動生成 | /api/og/[slug] edge runtime・全24アプリ layout.tsx で個別設定 |
| GitHub Actions | note-daily.yml / instagram-daily.yml 追加済み（Secrets設定待ち）|
| Vercel本番デプロイ | https://micro-apps-hub-seven.vercel.app ✅ |
| X自動投稿 | 日替わり24アプリローテーション（chatwork-x-automation）|
| Note自動投稿 | 個別アプリ紹介記事（apps:note コマンド）|
| Instagram自動投稿 | 個別アプリキャプション（apps:instagram コマンド）|

---

## 🔥 優先度：高（今週中）

### 1. TimesFM → Hugging Face Spaces デプロイ（コード完成・操作待ち）
```bash
# デプロイ手順（HF CLI 必要）
hf auth login                              # HF トークンでログイン
bash timesfm-server/deploy-to-hf.sh hiroshi57   # Space 作成 + push
vercel env add TIMESFM_API_URL production  # Vercel 環境変数に設定
```
- [x] `timesfm-server/` コード完成（TimesFM 2.5 / Dockerfile / deploy-to-hf.sh）
- [x] `app/components/PredictionCard.tsx` — スコア予測UIを実装・テトリスに組込済み
- [x] `/api/predict` route 完成（TimesFM連携 + 線形回帰フォールバック）
- [x] `.env.local.example` — セットアップ手順ドキュメント化
- [ ] HF アカウントで `hf auth login` → `bash timesfm-server/deploy-to-hf.sh <HF_USERNAME>`
- [ ] `TIMESFM_API_URL=https://<HF_USERNAME>-timesfm-server.hf.space` を Vercel に設定

### 2. Instagram 用アプリ画像の用意 ✅ 2026-06-29 完了
```
Instagram は画像必須。/api/og/{slug} OGP API を直接使用する方式に統一。
```
- [x] OGP 画像を Next.js で自動生成（`@vercel/og`）— `/api/og/{slug}` (1200×630, edge runtime)
- [x] `MICRO_APPS_DEFAULT_IMAGE_URL` — `.env.local` / `.env.local.example` に設定済み
- [x] `post-to-note.js` の eyecatch を `/api/og/{slug}` に修正（破損していた `/screenshots/*.png` 参照を解消）
- [x] Instagram スクリプトは最初から `/api/og/{slug}` を使用 ✅

### 3. GitHub Actions — Note・Instagram 定期投稿 ✅ 2026-06-29 完了
```
X は既に Actions で動いている。Note・Instagram も追加する。
```
- [x] `.github/workflows/note-daily.yml` 追加（毎日 07:00 JST）
- [x] `.github/workflows/instagram-daily.yml` 追加（週3回: 月水金 08:00 JST）
- [x] `.github/workflows/check-secrets.yml` 追加 — Secrets 設定確認 + dry-run プレビュー
- [x] スクリプト作成: `scripts/post-to-note.js` / `scripts/post-to-instagram.js`
- [ ] GitHub Secrets に設定が必要 → **check-secrets ワークフローで確認可能**:
  - `NOTE_SESSION` (Note.com の __session クッキー)
  - `INSTAGRAM_ACCESS_TOKEN` (Instagram Graph API 長期トークン)
  - `INSTAGRAM_USER_ID` (IG ビジネスアカウント ID)

---

## 📋 優先度：中（今月中）

### 4. OGP 画像自動生成 ✅ 2026-06-29 完了（タスク2に統合）
- [x] `@vercel/og` インストール済み
- [x] アプリ名・絵文字・価格・Pro バッジのカード生成
- [x] `<meta property="og:image">` / Twitter Card 設定済み (`layout.tsx`)

### 5. ユーザー認証フロー完成
- [ ] サインアップ → メール確認フロー動作確認
- [ ] Pro 購入後 → Supabase RLS でデータ保護確認
- [ ] `learning_records` テーブルへの書き込みテスト

### 6. Stripe 本番切替（収益化 GO 判断後）
```bash
# テスト → 本番キー差し替え手順
1. Stripe ダッシュボードで本番モードに切替
2. node scripts/create-stripe-prices.js  # 本番 Price ID 作成
3. node scripts/patch-price-ids.js       # lib/apps-config.ts 更新
4. Vercel 環境変数を sk_live_xxx に更新
5. Webhook を本番 URL で再登録
```
- [ ] 本番切替判断（テストで一定期間動作確認後）

---

## 💡 優先度：低（将来的に）

### 7. TikTok 投稿（既存 src/tiktok/ を活用）
- アプリのプレイ動画（OBS or Playwright録画）をTikTokに投稿

### 8. アプリ追加候補
| slug | タイトル | 価格 |
|------|---------|------|
| `flashcard` | 単語帳メーカー | ¥480 |
| `quiz-maker` | クイズ作成ツール | ¥580 |
| `haiku` | 俳句ジェネレーター | ¥380 |
| `bingo` | ビンゴカード | ¥380 |

### 9. Analytics ダッシュボード
- 各アプリの PV・Pro 購入数を可視化
- Supabase Analytics + Vercel Analytics 連携

---

## 🛠 コマンドリファレンス

```bash
# X 投稿
npm run apps:post
npm run apps:post:dry-run

# Note 投稿（個別アプリ記事）
npm run apps:note
npm run apps:note:dry-run

# Instagram 投稿（個別アプリキャプション）
npm run apps:instagram
npm run apps:instagram:dry-run

# デプロイ
npx vercel --yes --prod --scope YOUR_VERCEL_SCOPE

# Supabase 設定反映
npx supabase config push --project-ref vvascrjcjosbtcrlbakt
```

---

## 📌 重要リンク

| 項目 | URL |
|------|-----|
| 本番サイト | https://micro-apps-hub-seven.vercel.app |
| Vercel ダッシュボード | https://vercel.com/YOUR_VERCEL_SCOPE/micro-apps-hub |
| Supabase ダッシュボード | https://supabase.com/dashboard/project/vvascrjcjosbtcrlbakt |
| Stripe ダッシュボード | https://dashboard.stripe.com/test |
| GitHub | https://github.com/hiroshi57/micro-apps-hub |
