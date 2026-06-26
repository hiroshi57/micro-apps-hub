# Supabase セットアップ手順

## 1. プロジェクト作成
1. https://supabase.com → New project
2. 名前: `micro-apps-hub`
3. パスワード: 任意（メモしておく）
4. リージョン: Northeast Asia (Tokyo)

## 2. スキーマ適用
1. Supabase Dashboard → SQL Editor
2. `supabase/schema.sql` の内容を貼り付けて Run

## 3. 環境変数の取得
Settings → API から以下をコピー:

| 変数名 | 場所 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

## 4. .env.local に設定
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 5. Auth 設定
Authentication → URL Configuration:
- Site URL: https://your-vercel-url.vercel.app
- Redirect URLs: https://your-vercel-url.vercel.app/**

## 確認クエリ
```sql
select * from public.purchases limit 10;
select * from public.profiles limit 10;
```
