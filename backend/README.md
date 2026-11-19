# Sanjog model and reference backend

The sign classifier (`models/model.p`, a scikit-learn MLP: 42 hand-shape
features → 36 signs, A–Z and 0–9) lives here.

**Production does not deploy this folder.** The web app runs the same model
itself: `export_model.py` writes the weights to `src/lib/recognizer/model.json`,
which is used in the browser for instant feedback and in `/api/attempts` to
verify each result before awarding XP.

- `export_model.py`: export weights and parity fixtures after retraining (`npm run export:model`)
- `app.py`: Flask reference server (`/predict`), handy for experiments
- `tests/`: pytest suite for the reference server (`npm run test:backend`)

Parity between Python and TypeScript is checked by `npm run test:model`.
