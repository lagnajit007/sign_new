"""
Sanjog — Sign Language Recognition Backend

Flask server exposing:
  GET  /           — health check (503 until the model is loaded)
  POST /predict    — 42 normalised landmark values → signed sign prediction
  GET  /gestures   — list all supported gestures

Configuration via environment variables (see .env.example):
  PORT                        — listen port (default 7860, the Hugging Face Spaces port)
  FLASK_DEBUG                 — "true" to enable debug mode (never in production)
  MODEL_PATH                  — absolute path to model.p (default: models/model.p)
  FRONTEND_ORIGIN             — comma-separated allow-list of frontend origins for CORS
  RATELIMIT_PER_MINUTE        — max /predict requests per minute per client IP (default 900)
  RECOGNITION_SIGNING_SECRET  — shared secret used to HMAC-sign predictions so the
                                Next.js API can trust them when awarding XP
  TRUSTED_PROXY_HOPS          — number of reverse proxies in front of the app (default 1)
  SANJOG_SKIP_MODEL           — "1" to skip model loading (tests)
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import math
import os
import pickle
import secrets
import threading
import time
from pathlib import Path

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("sanjog.backend")

app = Flask(__name__)
# Landmark payloads are ~1 KB; anything bigger is not a legitimate request.
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

# Hosted behind a reverse proxy (Hugging Face / Render). Trust its X-Forwarded-For
# so rate limiting keys on the real client IP instead of the proxy's.
_proxy_hops = int(os.environ.get("TRUSTED_PROXY_HOPS", "1"))
if _proxy_hops > 0:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=_proxy_hops, x_proto=_proxy_hops, x_host=_proxy_hops)

# ── CORS ────────────────────────────────────────────────────────────────────
# Explicit allow-list. Recognition requests do not use cookies, so credentials
# are disabled. CORS is not authorization; XP is protected by the HMAC below.
FRONTEND_ORIGIN_RAW = os.environ.get("FRONTEND_ORIGIN", "")
ALLOWED_ORIGINS = {o.strip().rstrip("/") for o in FRONTEND_ORIGIN_RAW.split(",") if o.strip()}
if not ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = {"http://localhost:3000"}
    logger.warning("FRONTEND_ORIGIN is not set; allowing localhost only")

CORS(app, origins=sorted(ALLOWED_ORIGINS), supports_credentials=False, always_send=False)
logger.info("CORS allow-list: %s", sorted(ALLOWED_ORIGINS))

# ── Rate limiting ───────────────────────────────────────────────────────────
RATELIMIT_PER_MINUTE = os.environ.get("RATELIMIT_PER_MINUTE", "900")
limiter = Limiter(key_func=get_remote_address, app=app, default_limits=[], storage_uri="memory://")

# ── Signing ─────────────────────────────────────────────────────────────────
SIGNING_SECRET = os.environ.get("RECOGNITION_SIGNING_SECRET", "").encode()
if not SIGNING_SECRET:
    logger.warning("RECOGNITION_SIGNING_SECRET is not set; predictions will be unsigned and earn no XP")


def sign_prediction(label: str, confidence: float, issued_at: int, nonce: str) -> str | None:
    """HMAC-SHA256 over the canonical payload. Must match src/lib/recognition-signature.ts."""
    if not SIGNING_SECRET:
        return None
    payload = f"{label}|{confidence:.4f}|{issued_at}|{nonce}".encode()
    return hmac.new(SIGNING_SECRET, payload, hashlib.sha256).hexdigest()


# ── Model ───────────────────────────────────────────────────────────────────
MODEL_CANDIDATES: list[Path] = [
    *([Path(os.environ["MODEL_PATH"])] if os.environ.get("MODEL_PATH") else []),
    BASE_DIR / "models" / "model.p",
    BASE_DIR / "model.p",
]

model = None
classes: list[str] = []
_model_lock = threading.Lock()

if os.environ.get("SANJOG_SKIP_MODEL") != "1":
    model_path = next((c for c in MODEL_CANDIDATES if c.exists()), None)
    if model_path is None:
        logger.error("Model not found; checked: %s", [str(c) for c in MODEL_CANDIDATES])
    else:
        t0 = time.time()
        try:
            with open(model_path, "rb") as f:
                model_data = pickle.load(f)  # noqa: S301 — trusted file shipped with the image
            model = model_data["model"]
            # The classifier was trained on string labels ('0'..'9', 'A'..'Z').
            classes = [str(c) for c in model.classes_]
            logger.info("Model loaded in %.2fs from %s — %d classes", time.time() - t0, model_path, len(classes))
        except Exception:
            logger.exception("Failed to load model from %s", model_path)
            model = None

if model is None and os.environ.get("SANJOG_SKIP_MODEL") != "1":
    logger.error("All /predict requests will return 503 — model not loaded")


def classify(features: tuple[float, ...]) -> tuple[str, float]:
    """Return (label, confidence) for one 42-value feature vector."""
    arr = np.asarray(features, dtype=np.float64).reshape(1, -1)
    with _model_lock:
        proba = model.predict_proba(arr)[0]
    idx = int(np.argmax(proba))
    return classes[idx], float(proba[idx])


def _validate_landmarks(raw: object) -> tuple[tuple[float, ...] | None, str | None]:
    """Validate a landmarks payload. Returns (values, None) or (None, error)."""
    if not isinstance(raw, list):
        return None, "landmarks must be a list"
    if len(raw) != 42:
        return None, f"expected 42 values (21 landmarks x,y), got {len(raw)}"
    if any(isinstance(v, bool) or not isinstance(v, (int, float)) for v in raw):
        return None, "landmarks must contain only numbers"
    vals = tuple(float(v) for v in raw)
    if any(not math.isfinite(v) for v in vals):
        return None, "landmarks contain NaN or infinite values"
    # Features are normalised to the video frame (0..1) minus the hand's minimum,
    # so legitimate values sit in [0, 1]. Allow a small margin for jitter.
    if any(v < -0.05 or v > 1.05 for v in vals):
        return None, "landmarks must be normalised to the video frame (0..1)"
    return vals, None


def _error(message: str, status: int = 400):
    return jsonify({"error": message}), status


@app.errorhandler(HTTPException)
def handle_http_error(exc: HTTPException):
    """JSON for every HTTP error (404, 405, 413, 429 …) instead of Werkzeug's HTML."""
    message = "Too many requests" if exc.code == 429 else (exc.description or exc.name)
    return _error(message, exc.code or 500)


@app.errorhandler(Exception)
def handle_unexpected_error(exc: Exception):
    logger.exception("Unhandled error")
    return _error("Internal server error", 500)


@app.route("/", methods=["GET"])
def health_check():
    if model is not None:
        return jsonify({"status": "healthy", "model_loaded": True}), 200
    return jsonify({"status": "degraded", "model_loaded": False}), 503


@app.route("/predict", methods=["POST"])
@limiter.limit(lambda: f"{RATELIMIT_PER_MINUTE} per minute")
def predict():
    if model is None:
        return _error("Recognition model is not available", 503)

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or "landmarks" not in data:
        return _error("Request body must be JSON with a 'landmarks' field")

    landmarks, err = _validate_landmarks(data["landmarks"])
    if err:
        return _error(err)

    t0 = time.perf_counter()
    label, confidence = classify(landmarks)
    elapsed_ms = (time.perf_counter() - t0) * 1000

    confidence = round(confidence, 4)
    issued_at = int(time.time())
    nonce = secrets.token_hex(12)

    return jsonify({
        "prediction": label,
        "confidence": confidence,
        "processing_time_ms": round(elapsed_ms, 2),
        "issued_at": issued_at,
        "nonce": nonce,
        "signature": sign_prediction(label, confidence, issued_at, nonce),
    }), 200


@app.route("/gestures", methods=["GET"])
def list_gestures():
    return jsonify({"gestures": sorted(classes)}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    logger.info("Starting Sanjog backend on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug, threaded=True)
