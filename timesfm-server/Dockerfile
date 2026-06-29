FROM python:3.11-slim

WORKDIR /app

# 依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリコピー
COPY main.py .

# Hugging Face Spaces はポート 7860 を使用
EXPOSE 7860

# 起動（PORT 環境変数で上書き可能）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
