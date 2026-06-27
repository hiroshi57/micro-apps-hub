#!/bin/bash
# =============================================================
# Supabase 自動セットアップスクリプト
# =============================================================
# 使い方:
#   SUPABASE_ACCESS_TOKEN=sbp_xxx bash scripts/setup-supabase.sh
#
# トークン取得: https://supabase.com/dashboard/account/tokens

set -e

TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
VERCEL_SCOPE="YOUR_VERCEL_SCOPE"
PROJECT_NAME="micro-apps-hub"
REGION="ap-northeast-1"   # 東京

if [ -z "$TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN が未設定です"
  echo "   https://supabase.com/dashboard/account/tokens でトークンを取得してください"
  exit 1
fi

echo "🚀 Supabase プロジェクト作成中..."

# ----- プロジェクト作成 -----
RESPONSE=$(curl -s -X POST \
  "https://api.supabase.com/v1/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"organization_id\": \"\",
    \"region\": \"$REGION\",
    \"plan\": \"free\",
    \"db_pass\": \"$(openssl rand -base64 16 | tr -d '=+/')\"
  }")

PROJECT_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
  # 既存プロジェクト一覧から探す
  echo "ℹ️  プロジェクト作成できなかったため既存を検索中..."
  PROJECTS=$(curl -s \
    "https://api.supabase.com/v1/projects" \
    -H "Authorization: Bearer $TOKEN")
  PROJECT_ID=$(echo "$PROJECTS" | python3 -c "
import sys,json
projects = json.load(sys.stdin)
for p in projects:
    if p.get('name','').lower().replace(' ','-') == 'micro-apps-hub':
        print(p['id'])
        break
" 2>/dev/null || echo "")
fi

if [ -z "$PROJECT_ID" ]; then
  echo "❌ プロジェクト ID を取得できませんでした"
  echo "   Supabase ダッシュボードで手動作成してください:"
  echo "   https://supabase.com/dashboard/projects"
  exit 1
fi

echo "✅ プロジェクト ID: $PROJECT_ID"
echo "⏳ DB 起動を待機中（約 30 秒）..."
sleep 30

# ----- API キー取得 -----
KEYS=$(curl -s \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/api-keys" \
  -H "Authorization: Bearer $TOKEN")

ANON_KEY=$(echo "$KEYS" | python3 -c "
import sys,json
keys = json.load(sys.stdin)
for k in keys:
    if k.get('name') == 'anon':
        print(k['api_key'])
        break
" 2>/dev/null || echo "")

SERVICE_KEY=$(echo "$KEYS" | python3 -c "
import sys,json
keys = json.load(sys.stdin)
for k in keys:
    if k.get('name') == 'service_role':
        print(k['api_key'])
        break
" 2>/dev/null || echo "")

SUPABASE_URL="https://${PROJECT_ID}.supabase.co"

echo "✅ URL: $SUPABASE_URL"

# ----- スキーマ適用 -----
echo "📋 schema.sql を適用中..."
SCHEMA=$(cat "$(dirname "$0")/../supabase/schema.sql")
curl -s -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SCHEMA" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}" \
  > /dev/null

echo "✅ スキーマ適用完了"

# ----- Vercel 環境変数 更新 -----
echo "🔧 Vercel 環境変数を更新中..."

update_env() {
  local key="$1"
  local value="$2"
  echo "$value" | vercel env add "$key" production \
    --scope "$VERCEL_SCOPE" --force 2>/dev/null || true
}

update_env "NEXT_PUBLIC_SUPABASE_URL"      "$SUPABASE_URL"
update_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ANON_KEY"
update_env "SUPABASE_SERVICE_ROLE_KEY"     "$SERVICE_KEY"

echo "✅ Vercel 環境変数 更新完了"

# ----- .env.local 生成 -----
cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY
ENVEOF

echo ""
echo "============================================="
echo "✅ Supabase セットアップ完了！"
echo "   URL: $SUPABASE_URL"
echo "   .env.local に書き込み済み"
echo "============================================="
echo ""
echo "次のステップ: Stripe 設定"
echo "  STRIPE_SECRET_KEY=sk_live_xxx node scripts/create-stripe-prices.js"
