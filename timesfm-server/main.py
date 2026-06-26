"""
TimesFM Prediction API Server
==============================
Google TimesFM (https://github.com/google-research/timesfm) を
FastAPI でラップした予測APIサーバー。

micro-apps-hub の /api/predict から呼ばれる。

起動方法:
  pip install -r requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 8080

Hugging Face Spaces での起動:
  requirements.txt を配置して自動起動
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="TimesFM Prediction API", version="1.0.0")

# CORS: Vercel ドメインからの呼び出しを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://micro-apps-hub-seven.vercel.app",
        "https://micro-apps-2jque7wkt-takizawahiroshi-gmailcoms-projects.vercel.app",
        "http://localhost:3000",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ============================================================
# TimesFM モデルの遅延ロード
# ============================================================
_model = None
USE_TIMESFM = os.environ.get("USE_TIMESFM", "true").lower() == "true"


def get_model():
    global _model
    if _model is not None:
        return _model

    if not USE_TIMESFM:
        return None

    try:
        import timesfm  # type: ignore

        print("[TimesFM] Loading model...")
        _model = timesfm.TimesFm(
            hparams=timesfm.TimesFmHparams(
                backend="cpu",            # GPU がある場合は "gpu" に変更
                per_core_batch_size=32,
                horizon_len=7,            # 7ステップ先を予測
            ),
            checkpoint=timesfm.TimesFmCheckpoint(
                huggingface_repo_id="google/timesfm-1.0-200m",
            ),
        )
        print("[TimesFM] Model loaded successfully")
        return _model
    except Exception as e:
        print(f"[TimesFM] Failed to load model: {e}")
        return None


# ============================================================
# リクエスト / レスポンス型
# ============================================================

class PredictRequest(BaseModel):
    input: list[float]           # 過去のスコア時系列
    freq: int = 0                # 0 = irregular
    horizon: int = 7             # 予測ステップ数
    num_samples: int = 20        # 不確実性推定サンプル数


class PredictResponse(BaseModel):
    point_forecast: list[float]
    quantile_forecasts: Optional[dict[str, list[float]]] = None
    model: str
    horizon: int


# ============================================================
# ヘルスチェック
# ============================================================

@app.get("/health")
def health():
    model_ready = get_model() is not None
    return {
        "status": "ok",
        "model": "timesfm" if model_ready else "linear-fallback",
        "use_timesfm": USE_TIMESFM,
    }


# ============================================================
# 予測エンドポイント
# ============================================================

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if len(req.input) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 data points")

    scores = np.array(req.input, dtype=np.float32)
    horizon = min(req.horizon, 32)

    model = get_model()

    if model is not None:
        # ===== TimesFM 推論 =====
        try:
            forecast_input = [scores]
            freq = [req.freq]

            point_forecast, quantile_forecast = model.forecast(
                forecast_input,
                freq=freq,
            )

            pf = point_forecast[0][:horizon].tolist()
            # スコアを 0-100 にクランプ
            pf = [max(0.0, min(100.0, v)) for v in pf]

            # 分位数 (p10, p50, p90)
            qf = {}
            if quantile_forecast is not None:
                quantiles = [0.1, 0.5, 0.9]
                for i, q in enumerate(quantiles):
                    key = f"p{int(q*100)}"
                    qf[key] = [
                        max(0.0, min(100.0, v))
                        for v in quantile_forecast[0, :horizon, i].tolist()
                    ]

            return PredictResponse(
                point_forecast=pf,
                quantile_forecasts=qf if qf else None,
                model="timesfm",
                horizon=horizon,
            )
        except Exception as e:
            print(f"[TimesFM] Inference error: {e}, falling back to linear")

    # ===== フォールバック: 加重線形回帰 =====
    pf = _weighted_linear_forecast(scores, horizon)
    return PredictResponse(
        point_forecast=pf,
        model="linear-fallback",
        horizon=horizon,
    )


def _weighted_linear_forecast(scores: np.ndarray, horizon: int) -> list[float]:
    n = len(scores)
    x = np.arange(n, dtype=np.float32)
    # 最近のデータを重視
    weights = 1.0 + (x / n) * 2.0
    total_w = weights.sum()

    mean_x = (weights * x).sum() / total_w
    mean_y = (weights * scores).sum() / total_w

    num = (weights * (x - mean_x) * (scores - mean_y)).sum()
    den = (weights * (x - mean_x) ** 2).sum()
    slope = num / den if den != 0 else 0.0
    intercept = mean_y - slope * mean_x

    return [
        float(max(0.0, min(100.0, intercept + slope * (n + i))))
        for i in range(horizon)
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
