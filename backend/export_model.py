"""
Export the scikit-learn MLP in models/model.p to JSON so the web app can run
recognition itself (src/lib/recognizer). Re-run after retraining:

    python backend/export_model.py

Writes:
  src/lib/recognizer/model.json     weights, biases, activation, class labels
  src/lib/recognizer/fixtures.json  inputs + expected probabilities for the
                                    TypeScript parity test (npm run test:model)
"""

from __future__ import annotations

import json
import pickle
import warnings
from pathlib import Path

import numpy as np

warnings.filterwarnings("ignore")  # sklearn minor-version pickle warnings

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
OUT = ROOT / "src" / "lib" / "recognizer"


def r(x: float) -> float:
    # 9 significant digits keeps float64 parity well inside the test tolerance.
    return float(f"{x:.9g}")


def main() -> None:
    model = pickle.load(open(BACKEND / "models" / "model.p", "rb"))["model"]
    assert model.activation == "relu" and model.out_activation_ == "softmax", "unsupported MLP config"

    OUT.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": "backend/models/model.p (sklearn MLPClassifier), exported by backend/export_model.py",
        "inputSize": int(model.n_features_in_),
        "activation": model.activation,
        "classes": [str(c) for c in model.classes_],
        # layers[i].weights is [in][out], matching sklearn coefs_
        "layers": [
            {"weights": [[r(v) for v in row] for row in W], "biases": [r(v) for v in b]}
            for W, b in zip(model.coefs_, model.intercepts_)
        ],
    }
    (OUT / "model.json").write_text(json.dumps(payload, separators=(",", ":")))

    # Fixtures: real training rows when the (gitignored) dataset is present,
    # plus synthetic vectors so the test also runs on a fresh clone.
    rng = np.random.default_rng(42)
    inputs: list[list[float]] = []
    dataset = BACKEND / "models" / "asl_dataset.pickle"
    if dataset.exists():
        data = pickle.load(open(dataset, "rb"))
        rows = np.asarray([d for d in data["data"] if len(d) == model.n_features_in_], dtype=float)
        idx = rng.choice(len(rows), size=min(60, len(rows)), replace=False)
        inputs += rows[idx].tolist()
    inputs += rng.uniform(0, 0.35, size=(20, model.n_features_in_)).tolist()

    X = np.asarray(inputs)
    proba = model.predict_proba(X)
    fixtures = [
        {"input": [r(v) for v in x], "label": str(model.classes_[int(np.argmax(p))]), "probabilities": [r(v) for v in p]}
        for x, p in zip(X, proba)
    ]
    (OUT / "fixtures.json").write_text(json.dumps(fixtures, separators=(",", ":")))
    print(f"Wrote model.json ({len(model.classes_)} classes) and {len(fixtures)} fixtures to {OUT}")


if __name__ == "__main__":
    main()
