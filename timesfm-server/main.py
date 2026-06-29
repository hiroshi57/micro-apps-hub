"""
TimesFM Prediction API Server  (v2 — TimesFM 2.x 対応)
======================================================
Google TimesFM 2.5 (200M) を FastAPI でラップした予測APIサーバー。
https://huggingface.co/google/timesfm-2.5-200m-pytorch

起動方法:
  pip install -r requirements.txt
  uvicorn main:app --host 0.0.0.0 --port 7860

環境変数:
  USE_TIMESFM=false  → 線形フォールバックのみ (ビルドテスト用)
  PORT=7860          → ポート上書き (HF Spaces はデフォルト 7860)
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="TimesFM Prediction API", version="2.0.0")

# CORS: Vercel ドメインからの呼び出しを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://micro-apps-hub-seven.vercel.app",
        "http://localhost:3000",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ============================================================
# TimesFM 2.x モデルの遅延ロード
# ============================================================
_model = None
_model_version: str = "none"
USE_TIMESFM = os.environ.get("USE_TIMESFM", "true").lower() == "true"
HF_REPO_ID   = "google/timesfm-2.5-200m-pytorch"


def get_model():
    global _model, _model_version
    if _model is not None:
        return _model

    if not USE_TIMESFM:
        return None

    try:
        # TimesFM 2.x API
        from timesfm import TimesFM_2p5_200M_torch  # type: ignore
        print(f"[TimesFM] Loading {HF_REPO_ID} ...")
        model = TimesFM_2p5_200M_torch.from_pretrained(HF_REPO_ID)
        model.model.eval()
        _model = model
        _model_version = "timesfm-2.5"
        print("[TimesFM] Model loaded successfully")
        return _model
    except Exception as e:
        print(f"[TimesFM] Failed to load TimesFM 2.x: {e}")

    return None


# ============================================================
# リクエスト / レスポンス型
# ============================================================

class PredictRequest(BaseModel):
    input: list[float]       # 過去のスコア時系列 (最低3点)
    freq: int = 0            # 0 = irregular (TimesFM 1.x 互換フィールド, 現在未使用)
    horizon: int = 7         # 予測ステップ数 (最大32)
    num_samples: int = 20    # (互換フィールド, 現在未使用)


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
        "model": _model_version if model_ready else "linear-fallback",
        "use_timesfm": USE_TIMESFM,
        "hf_repo": HF_REPO_ID,
    }


# ============================================================
# 予測エンドポイント
# ============================================================

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if len(req.input) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 data points")

    scores  = np.array(req.input, dtype=np.float32)
    horizon = min(req.horizon, 32)
    model   = get_model()

    if model is not None:
        try:
            # forecast_naive(horizon, inputs) → list[ndarray]
            # outputs[0] shape: [total_steps, q]
            #   - 先頭列 ([:,0])  : 点予測 (medianに近い推定値)
            #   - 残列   ([:,1:]) : 分位数 (0.1 〜 0.9)
            raw = model.model.forecast_naive(horizon=horizon, inputs=[scores])
            output = raw[0]  # shape: [horizon_or_more, q]

            pf = [
                float(max(0.0, min(100.0, output[i, 0])))
                for i in range(min(horizon, output.shape[0]))
            ]
            # 分位数列が 10 列 (q=10) の場合, 1〜9列目が 0.1〜0.9
            qf: dict[str, list[float]] = {}
            quantile_labels = ["p10", "p20", "p30", "p40", "p50", "p60", "p70", "p80", "p90"]
            if output.shape[1] > 1:
                for qi, label in enumerate(quantile_labels):
                    col = qi + 1
                    if col < output.shape[1]:
                        qf[label] = [
                            float(max(0.0, min(100.0, output[i, col])))
                            for i in range(min(horizon, output.shape[0]))
                        ]

            return PredictResponse(
                point_forecast=pf,
                quantile_forecasts=qf if qf else None,
                model=_model_version,
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


# ============================================================
# 加重線形回帰フォールバック
# ============================================================

def _weighted_linear_forecast(scores: np.ndarray, horizon: int) -> list[float]:
    n = len(scores)
    x = np.arange(n, dtype=np.float32)
    weights  = 1.0 + (x / n) * 2.0
    total_w  = weights.sum()
    mean_x   = (weights * x).sum() / total_w
    mean_y   = (weights * scores).sum() / total_w
    num      = (weights * (x - mean_x) * (scores - mean_y)).sum()
    den      = (weights * (x - mean_x) ** 2).sum()
    slope    = num / den if den != 0 else 0.0
    intercept = mean_y - slope * mean_x
    return [
        float(max(0.0, min(100.0, intercept + slope * (n + i))))
        for i in range(horizon)
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 7860)))
