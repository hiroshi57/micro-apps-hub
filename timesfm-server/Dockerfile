FROM python:3.11-slim

WORKDIR /app

# 依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリコピー
COPY main.py .

# ポート
EXPOSE 8080

# 起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
