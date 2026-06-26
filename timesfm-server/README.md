---
title: MicroApps TimesFM Prediction API
emoji: 📈
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# TimesFM Prediction API

Google TimesFM を使ったゲームスコア予測 API。

## エンドポイント

### `GET /health`
モデルの状態確認。

### `POST /predict`
```json
{
  "input": [45, 52, 61, 58, 70, 75, 80],
  "freq": 0,
  "horizon": 7
}
```

レスポンス:
```json
{
  "point_forecast": [82, 84, 86, 85, 88, 90, 91],
  "model": "timesfm",
  "horizon": 7
}
```

## Vercel 連携

Spaces の URL を `TIMESFM_API_URL` に設定:
```
TIMESFM_API_URL=https://<your-space>.hf.space
```
