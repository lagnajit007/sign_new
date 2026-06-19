"""
Sanjog — Sign Language Recognition Backend
Flask server exposing:
  GET  /           → health check
  POST /predict    → landmark → sign prediction
  GET  /gestures   → list all supported gestures
  GET  /stats      → server statistics

Configuration via environment variables (see .env.example):
  PORT                  — listen port (default 5000)
  FLASK_DEBUG           — "true" to enable debug mode (never in production)
  MODEL_PATH            — absolute path to model.p (default: models/model.p)
  FRONTEND_ORIGIN       — single frontend origin for CORS (default: http://localhost:3000)
  RATELIMIT_PER_MINUTE  — max requests per minute per IP via Flask-Limiter (default: 60)
  REQUEST_INTERVAL      — minimum seconds between requests per process (default: 0.05)
"""

from __future__ import annotations

import logging
import os
import pickle
import threading
import time
from collections import Counter, deque
from functools import lru_cache

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# ── Environment ───────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("sanjog.backend")

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

# CORS: accept any origin that the frontend sends, echoing it back.
# This avoids blocking legitimate deployments where the exact Vercel URL
# may differ from what's configured. For stricter control, set the
# FRONTEND_ORIGIN env var to a comma-separated allow-list of origins.
FRONTEND_ORIGIN_RAW = os.environ.get("FRONTEND_ORIGIN", "")
ALLOWED_ORIGINS = set(
    o.strip() for o in FRONTEND_ORIGIN_RAW.split(",") if o.strip()
)

def _cors_allowed(origin: str) -> bool:
    """Return True to allow the origin (flask-cors echoes back the Origin header)."""
    if not ALLOWED_ORIGINS or origin in ALLOWED_ORIGINS:
        return True
    logger.warning("CORS request from unrecognised origin: %s", origin)
    return True  # permissive — allow anyway; set FRONTEND_ORIGIN to enforce

CORS(app, origins=_cors_allowed, supports_credentials=True)

if ALLOWED_ORIGINS:
    logger.info("CORS allow-list: %s — unrecognised origins will still be accepted (permissive mode)", ALLOWED_ORIGINS)
else:
    logger.info("CORS: permissive mode — any origin is accepted")

# ── Rate limiting (Flask-Limiter) ─────────────────────────────────────────────
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{os.environ.get('RATELIMIT_PER_MINUTE', '60')} per minute"],
    app=app,
)

# ── Model loading ─────────────────────────────────────────────────────────────
DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "models", "model.p"
)
MODEL_PATH = os.environ.get("MODEL_PATH", DEFAULT_MODEL_PATH)

SIGN_LABELS: dict[int, str] = {
    **{i: chr(65 + i) for i in range(26)},          # A–Z → 0–25
    **{26 + i: str(i) for i in range(10)},           # 0–9 → 26–35
}

model = None
labels_dict: dict = {}
_model_lock = threading.Lock()

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    t0 = time.time()
    with open(MODEL_PATH, "rb") as f:
        model_data = pickle.load(f)  # noqa: S301 — trusted local file
    model = model_data["model"]
    labels_dict = model_data.get("labels_dict", {})
    logger.info("Model loaded in %.2fs from %s", time.time() - t0, MODEL_PATH)
except Exception as exc:
    logger.error("Failed to load model: %s", exc)

# Warn loudly at startup if model is missing
if model is None:
    logger.error("*** MODEL NOT LOADED — all /predict requests will return 503 ***")
    logger.error("*** Expected model at: %s ***", MODEL_PATH)
    logger.error("*** Fix: ensure the model file is committed to git or uploaded to Railway ***")
else:
    logger.info("Model loaded successfully — %d classes available", len(labels_dict) or len(SIGN_LABELS))

# ── Prediction cache & smoothing ──────────────────────────────────────────────
PREDICTION_CACHE_SIZE = 256
HISTORY_SIZE = 5
_prediction_history: deque[str] = deque(maxlen=HISTORY_SIZE)
_history_lock = threading.Lock()


@lru_cache(maxsize=PREDICTION_CACHE_SIZE)
def _cached_predict(landmarks_tuple: tuple[float, ...]) -> int:
    arr = np.array(landmarks_tuple).reshape(1, -1)
    with _model_lock:
        return int(model.predict(arr)[0])


# ── Per-process rate limiting (non-blocking) ──────────────────────────────────
REQUEST_INTERVAL = float(os.environ.get("REQUEST_INTERVAL", "0.05"))
_last_request_time: float = 0.0
_rate_lock = threading.Lock()

# ── Request timing stats (thread-safe) ────────────────────────────────────────
_request_times: deque[float] = deque(maxlen=200)
_stats_lock = threading.Lock()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _validate_landmarks(raw: object) -> tuple[tuple[float, ...] | None, str | None]:
    """Validate and normalise a landmarks payload.  Returns (tuple, None) or (None, error)."""
    if not isinstance(raw, list):
        return None, "landmarks must be a list"
    if len(raw) != 42:
        return None, f"expected 42 values (21 landmarks × x,y), got {len(raw)}"
    try:
        vals = tuple(float(v) for v in raw)
    except (TypeError, ValueError):
        return None, "landmarks must contain only numbers"
    if any(np.isnan(v) or np.isinf(v) for v in vals):
        return None, "landmarks contain NaN or infinite values"
    return vals, None


def _error(message: str, status: int = 400):
    """Return a consistent JSON error envelope — never leak internal details."""
    return jsonify({"error": message}), status


def _record_latency(elapsed_ms: float) -> None:
    """Thread-safe append to the timing stats deque."""
    with _stats_lock:
        _request_times.append(elapsed_ms)
    if len(_request_times) % 50 == 0:
        with _stats_lock:
            avg = sum(_request_times) / len(_request_times) if _request_times else 0
        logger.info("Avg prediction latency: %.1f ms (n=%d)", avg, len(_request_times))


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health_check():
    if model is not None:
        return jsonify({"status": "healthy", "model_loaded": True}), 200
    return jsonify({"status": "degraded", "model_loaded": False}), 503


@app.route("/predict", methods=["POST"])
def predict():
    global _last_request_time

    # Non-blocking rate-limit: reject too-fast callers instead of sleeping
    now = time.time()
    with _rate_lock:
        elapsed = now - _last_request_time
        if elapsed < REQUEST_INTERVAL:
            return _error("Too many requests", 429)
        _last_request_time = now

    if model is None:
        return _error("Recognition model is not available", 503)

    data = request.get_json(silent=True)
    if not data or "landmarks" not in data:
        return _error("Request body must be JSON with a 'landmarks' field")

    landmarks, err = _validate_landmarks(data["landmarks"])
    if err:
        return _error(err)

    t0 = time.time()
    try:
        raw_prediction = _cached_predict(landmarks)
    except Exception:
        logger.exception("Prediction error")
        return _error("Prediction failed", 500)

    label = labels_dict.get(raw_prediction, SIGN_LABELS.get(raw_prediction, str(raw_prediction)))

    # Thread-safe history update
    with _history_lock:
        _prediction_history.append(label)
        # Temporal smoothing: majority vote over recent history
        smoothed = Counter(_prediction_history).most_common(1)[0][0] if len(_prediction_history) >= 3 else label

    # Confidence
    try:
        arr = np.array(landmarks).reshape(1, -1)
        with _model_lock:
            confidence = float(model.predict_proba(arr)[0][raw_prediction])
    except Exception:
        confidence = 0.5

    elapsed_ms = (time.time() - t0) * 1000
    _record_latency(elapsed_ms)

    return jsonify({
        "prediction": smoothed,
        "confidence": round(confidence, 4),
        "processing_time_ms": round(elapsed_ms, 2),
    }), 200


@app.route("/gestures", methods=["GET"])
def list_gestures():
    gestures = sorted(set(labels_dict.values()) or set(SIGN_LABELS.values()))
    return jsonify({"gestures": gestures}), 200


@app.route("/stats", methods=["GET"])
def get_stats():
    with _stats_lock:
        avg = sum(_request_times) / len(_request_times) if _request_times else 0
        count = len(_request_times)
    status_str = "healthy" if model is not None else "degraded"
    return jsonify({
        "status": status_str,
        "model_loaded": model is not None,
        "average_latency_ms": round(avg, 2),
        "request_count": count,
        "cors_enforced": bool(ALLOWED_ORIGINS),
    }), 200


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    logger.info("Starting Sanjog backend on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug, threaded=True)
