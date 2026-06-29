#!/usr/bin/env python3
"""
TimesFM サーバーを Hugging Face Spaces にデプロイする。

使い方:
  python deploy-to-hf.py --username <HF_USERNAME> --token <HF_WRITE_TOKEN>

例:
  python deploy-to-hf.py --username hiroshi57 --token hf_xxxxxxxxxxxx

トークン取得先: https://huggingface.co/settings/tokens (Write 権限)

環境変数でトークンを渡すことも可:
  HF_TOKEN=hf_xxx python deploy-to-hf.py --username hiroshi57
"""

import argparse
import os
import sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Deploy TimesFM to HF Spaces")
    parser.add_argument("--username", required=True, help="Hugging Face ユーザー名")
    parser.add_argument("--token",    default=os.environ.get("HF_TOKEN", ""),
                        help="HF Write トークン (または HF_TOKEN 環境変数)")
    parser.add_argument("--space",    default="timesfm-prediction-api",
                        help="Space 名 (デフォルト: timesfm-prediction-api)")
    parser.add_argument("--private",  action="store_true", help="プライベート Space にする")
    args = parser.parse_args()

    if not args.token:
        print("❌ HF トークンが必要です。")
        print("   --token オプション、または HF_TOKEN 環境変数で指定してください。")
        print("   トークン取得: https://huggingface.co/settings/tokens")
        sys.exit(1)

    try:
        from huggingface_hub import HfApi
    except ImportError:
        print("❌ huggingface_hub がインストールされていません。")
        print("   pip install huggingface_hub")
        sys.exit(1)

    api      = HfApi(token=args.token)
    space_id = f"{args.username}/{args.space}"
    src_dir  = Path(__file__).parent

    # ── 1. Space 作成 ──────────────────────────────────────────────
    print(f"\n[1/3] Space 作成中: {space_id}")
    try:
        api.create_repo(
            repo_id   = space_id,
            repo_type = "space",
            space_sdk = "docker",
            private   = args.private,
            exist_ok  = True,
        )
        print(f"  ✅ Space ready: https://huggingface.co/spaces/{space_id}")
    except Exception as e:
        print(f"  ❌ Space 作成失敗: {e}")
        sys.exit(1)

    # ── 2. ファイルをアップロード ───────────────────────────────────
    files = ["Dockerfile", "main.py", "requirements.txt", "README.md"]
    print(f"\n[2/3] ファイルをアップロード中...")
    for fname in files:
        fpath = src_dir / fname
        if not fpath.exists():
            print(f"  ⚠️  {fname} が見つかりません。スキップ。")
            continue
        try:
            api.upload_file(
                path_or_fileobj = str(fpath),
                path_in_repo    = fname,
                repo_id         = space_id,
                repo_type       = "space",
                commit_message  = f"deploy: update {fname}",
            )
            print(f"  ✅ {fname}")
        except Exception as e:
            print(f"  ❌ {fname}: {e}")

    # ── 3. 完了メッセージ ──────────────────────────────────────────
    api_url = f"https://{args.username}-{args.space}.hf.space"
    print(f"\n[3/3] デプロイ完了！")
    print(f"\n  Space URL : https://huggingface.co/spaces/{space_id}")
    print(f"  API URL   : {api_url}")
    print(f"\n  /health   : {api_url}/health")
    print(f"  /predict  : {api_url}/predict  (POST)")
    print(f"\n📋 Vercel 環境変数に追加:")
    print(f"  vercel env add TIMESFM_API_URL production")
    print(f"  → 値: {api_url}")
    print(f"\n⏳ HF Spaces のビルドには数分かかります。")
    print(f"   ビルド状況: https://huggingface.co/spaces/{space_id}")


if __name__ == "__main__":
    main()
