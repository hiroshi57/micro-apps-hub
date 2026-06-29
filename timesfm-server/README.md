---
title: MicroApps TimesFM Prediction API
emoji: 📈
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

# TimesFM 2.5 Prediction API

Google TimesFM 2.5 (200M パラメータ) を使ったゲームスコア予測 API。  
[micro-apps-hub](https://micro-apps-hub-seven.vercel.app) の `/api/predict` から呼び出される。

## モデル

- **ベースモデル**: [google/timesfm-2.5-200m-pytorch](https://huggingface.co/google/timesfm-2.5-200m-pytorch)
- **フォールバック**: TimesFM ロード失敗時は加重線形回帰を使用

## エンドポイント

### `GET /health`

```json
{
  "status": "ok",
  "model": "timesfm-2.5",
  "use_timesfm": true,
  "hf_repo": "google/timesfm-2.5-200m-pytorch"
}
```

### `POST /predict`

リクエスト:
```json
{
  "input": [45, 52, 61, 58, 70, 75, 80],
  "horizon": 7
}
```

レスポンス:
```json
{
  "point_forecast": [82.1, 84.3, 86.0, 85.5, 88.2, 90.1, 91.4],
  "quantile_forecasts": {
    "p10": [75.0, 77.2, ...],
    "p50": [82.1, 84.3, ...],
    "p90": [89.5, 91.0, ...]
  },
  "model": "timesfm-2.5",
  "horizon": 7
}
```

## Vercel 連携

Space の API URL を Vercel 環境変数に設定:

```bash
vercel env add TIMESFM_API_URL production
# 値: https://<username>-timesfm-prediction-api.hf.space
```

## ローカル起動

```bash
cd timesfm-server
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7860
```

## デプロイ

```bash
cd timesfm-server
python deploy-to-hf.py --username <HF_USERNAME> --token <HF_WRITE_TOKEN>
```
