"""Tests for /predict: string labels, validation, signing and JSON errors.
Run: python -m pytest backend/tests  (or python -m unittest discover backend/tests)
"""
import hashlib
import hmac
import importlib.util
import os
import pickle
import unittest
from pathlib import Path

SECRET = "test-secret"
os.environ["FRONTEND_ORIGIN"] = "http://localhost:3000"
os.environ["RECOGNITION_SIGNING_SECRET"] = SECRET
os.environ["RATELIMIT_PER_MINUTE"] = "5"
os.environ.pop("SANJOG_SKIP_MODEL", None)

BACKEND = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location("sanjog_backend_predict", BACKEND / "app.py")
backend = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(backend)


class PredictTests(unittest.TestCase):
    def setUp(self):
        backend.limiter.reset()
        self.client = backend.app.test_client()

    def post(self, landmarks):
        return self.client.post("/predict", json={"landmarks": landmarks})

    def test_model_loaded(self):
        self.assertIsNotNone(backend.model)
        self.assertEqual(self.client.get("/").status_code, 200)

    def test_predict_returns_valid_label_and_confidence(self):
        res = self.post([0.1 + 0.01 * (i % 7) for i in range(42)])
        self.assertEqual(res.status_code, 200, res.get_json())
        body = res.get_json()
        self.assertIn(body["prediction"], backend.classes)
        self.assertTrue(0 <= body["confidence"] <= 1)

    def test_classify_letter_from_training_like_vector(self):
        # Pick a training-shaped vector for which the model predicts a letter.
        model = backend.model
        import numpy as np
        rng = np.random.default_rng(0)
        found_letter = False
        for _ in range(200):
            vec = tuple(rng.uniform(0, 0.3, 42))
            label, conf = backend.classify(vec)
            self.assertIn(label, backend.classes)
            if label.isalpha():
                found_letter = True
                break
        self.assertTrue(found_letter, "expected at least one letter prediction")
        self.assertIsNotNone(model)

    def test_signature_matches_canonical_payload(self):
        body = self.post([0.1] * 42).get_json()
        payload = f'{body["prediction"]}|{body["confidence"]:.4f}|{body["issued_at"]}|{body["nonce"]}'
        expected = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        self.assertEqual(body["signature"], expected)

    def test_rejects_wrong_length(self):
        self.assertEqual(self.post([0.1] * 10).status_code, 400)

    def test_rejects_booleans_and_strings(self):
        self.assertEqual(self.post([True] * 42).status_code, 400)
        self.assertEqual(self.post(["0.1"] * 42).status_code, 400)

    def test_rejects_unnormalised_pixels(self):
        self.assertEqual(self.post([320.0] * 42).status_code, 400)

    def test_rejects_non_json(self):
        res = self.client.post("/predict", data="nope", content_type="text/plain")
        self.assertEqual(res.status_code, 400)

    def test_404_is_json(self):
        res = self.client.get("/missing")
        self.assertEqual(res.status_code, 404)
        self.assertIn("error", res.get_json())

    def test_rate_limit_returns_json_429(self):
        codes = [self.post([0.1] * 42).status_code for _ in range(7)]
        self.assertIn(429, codes)
        res = self.post([0.1] * 42)
        self.assertEqual(res.get_json()["error"], "Too many requests")


if __name__ == "__main__":
    unittest.main()
