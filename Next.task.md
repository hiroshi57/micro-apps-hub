# Next.task.md — micro-apps-hub 今後のタスク

> 更新日: 2026-06-26

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
| TimesFMサーバー | FastAPIラッパー実装済み（HFSpacesデプロイ待ち）|
| Vercel本番デプロイ | https://micro-apps-hub-seven.vercel.app ✅ |
| X自動投稿 | 日替わり24アプリローテーション（chatwork-x-automation）|
| Note自動投稿 | 個別アプリ紹介記事（apps:note コマンド）|
| Instagram自動投稿 | 個別アプリキャプション（apps:instagram コマンド）|

---

## 🔥 優先度：高（今週中）

### 1. TimesFM → Hugging Face Spaces デプロイ
```
timesfm-server/ を HF Spaces にデプロイ
→ TIMESFM_API_URL を Vercel 環境変数に設定
```
- [ ] HF アカウントで新規 Space 作成（Docker SDK）
- [ ] `timesfm-server/` を push
- [ ] `TIMESFM_API_URL=https://xxx.hf.space` を Vercel に設定
- [ ] `/api/predict` エンドポイントで疎通確認

### 2. Instagram 用アプリ画像の用意
```
Instagram は画像必須。各アプリのスクリーンショットが必要。
```
- [ ] Playwright でアプリ画面を自動撮影するスクリプト作成
  - `scripts/capture-app-screenshots.js`
- [ ] OGP 画像を Next.js で自動生成（`@vercel/og`）
  - `app/api/og/[slug]/route.tsx` を追加
- [ ] `MICRO_APPS_DEFAULT_IMAGE_URL` を `.env.local` に設定

### 3. GitHub Actions — Note・Instagram 定期投稿
```
X は既に Actions で動いている。Note・Instagram も追加する。
```
- [ ] `.github/workflows/note-daily.yml` 追加（毎日 07:00 JST）
- [ ] `.github/workflows/instagram-daily.yml` 追加（週3回: 月水金）
- [ ] GitHub Secrets に `NOTE_EMAIL`, `NOTE_PASSWORD`, `INSTAGRAM_USERNAME`, `INSTAGRAM_PASSWORD` 追加

---

## 📋 優先度：中（今月中）

### 4. OGP 画像自動生成
```typescript
// app/api/og/[slug]/route.tsx
// Vercel OG で各アプリのカード画像を自動生成
// ImageResponse → Instagram / X カード / Note のサムネに流用
```
- [ ] `@vercel/og` インストール
- [ ] アプリ名・絵文字・無料/Pro の情報を載せたカード
- [ ] `<meta property="og:image">` に設定

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
