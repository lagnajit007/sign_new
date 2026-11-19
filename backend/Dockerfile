# Sanjog recognition backend — built for Hugging Face Spaces (Docker SDK).
# Spaces run the container as UID 1000 and route traffic to port 7860.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

RUN useradd --create-home --uid 1000 app
WORKDIR /home/app/backend

COPY --chown=app:app requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app app.py ./
COPY --chown=app:app models/model.p ./models/model.p

USER app
EXPOSE 7860

# gthread workers handle many short concurrent requests; inference takes ~5 ms.
CMD gunicorn --workers 2 --threads 8 --worker-class gthread \
    --bind 0.0.0.0:${PORT} --timeout 30 --log-level info app:app
