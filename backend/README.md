---
title: Sanjog Recognition
emoji: 🤟
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Sanjog recognition backend

Flask service that classifies 42 normalised hand-landmark values into a sign
(A–Z, 0–9) and returns an HMAC-signed prediction.

This folder is deployed as a Hugging Face Space (Docker SDK). The YAML header
above is read by Hugging Face; see `../DEPLOYMENT.md` for setup steps.

Required Space secrets:

| Name | Value |
| --- | --- |
| `FRONTEND_ORIGIN` | Your Vercel URL, e.g. `https://sanjog.vercel.app` |
| `RECOGNITION_SIGNING_SECRET` | Same random value as in Vercel |
