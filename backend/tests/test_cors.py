"""Regression tests for the recognition API CORS contract.
Run after installing backend/requirements.txt: python -m unittest backend.tests.test_cors
"""
import importlib.util
import os
import unittest
from pathlib import Path

os.environ["FRONTEND_ORIGIN"] = "https://sanjog.vercel.app,http://localhost:3000"
os.environ["SANJOG_SKIP_MODEL"] = "1"
spec = importlib.util.spec_from_file_location("sanjog_backend", Path(__file__).parents[1] / "app.py")
backend = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(backend)

class CorsPolicyTests(unittest.TestCase):
    def setUp(self):
        self.client = backend.app.test_client()
    def preflight(self, origin=None):
        headers = {"Access-Control-Request-Method": "POST"}
        if origin: headers["Origin"] = origin
        return self.client.options("/predict", headers=headers)
    def test_allows_configured_production_origin(self):
        self.assertEqual(self.preflight("https://sanjog.vercel.app").headers.get("Access-Control-Allow-Origin"), "https://sanjog.vercel.app")
    def test_allows_configured_local_origin(self):
        self.assertEqual(self.preflight("http://localhost:3000").headers.get("Access-Control-Allow-Origin"), "http://localhost:3000")
    def test_rejects_unconfigured_origin(self):
        self.assertIsNone(self.preflight("https://evil.example").headers.get("Access-Control-Allow-Origin"))
    def test_no_origin_does_not_receive_cors_grant(self):
        self.assertIsNone(self.preflight().headers.get("Access-Control-Allow-Origin"))
    def test_does_not_allow_credentials(self):
        self.assertIsNone(self.preflight("https://sanjog.vercel.app").headers.get("Access-Control-Allow-Credentials"))

if __name__ == "__main__":
    unittest.main()