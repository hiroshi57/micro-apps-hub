#!/bin/bash
# TimesFM サーバーを Hugging Face Spaces にデプロイするスクリプト
#
# 事前準備:
#   1. https://huggingface.co/settings/tokens で Write トークンを取得
#   2. hf auth login  # トークンを貼り付けてログイン
#
# 使い方:
#   bash deploy-to-hf.sh <HF_USERNAME>
#
# 例:
#   bash deploy-to-hf.sh hiroshi57

set -e

HF_USERNAME="${1:?Usage: bash deploy-to-hf.sh <HF_USERNAME>}"
SPACE_NAME="timesfm-server"
SPACE_ID="${HF_USERNAME}/${SPACE_NAME}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== TimesFM HF Spaces デプロイ ==="
echo "Space: ${SPACE_ID}"

# ── Space の作成（既存の場合はスキップ） ──
echo "[1/3] Space 作成中..."
hf repos create "${SPACE_NAME}" --type space --space-sdk docker 2>/dev/null || \
  echo "  → Space は既に存在します。スキップ。"

# ── ファイルをアップロード ──
echo "[2/3] ファイルをアップロード中..."
hf upload "${SPACE_ID}" "${SCRIPT_DIR}/." . \
  --repo-type space \
  --commit-message "deploy: update timesfm server"

echo "[3/3] デプロイ完了！"
echo ""
echo "Space URL: https://huggingface.co/spaces/${SPACE_ID}"
echo "API URL  : https://${HF_USERNAME}-${SPACE_NAME}.hf.space"
echo ""
echo "次のステップ:"
echo "  Vercel 環境変数に設定:"
echo "  TIMESFM_API_URL=https://${HF_USERNAME}-${SPACE_NAME}.hf.space"
echo "  vercel env add TIMESFM_API_URL production"
