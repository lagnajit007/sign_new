FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for TensorFlow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Cache-bust layer — Railway-provided ARGs change every deploy, forcing COPY re-run
ARG RAILWAY_GIT_COMMIT_SHA
ARG RAILWAY_SNAPSHOT_ID
ARG RAILWAY_DEPLOYMENT_ID
RUN echo "Build: commit=$RAILWAY_GIT_COMMIT_SHA snapshot=$RAILWAY_SNAPSHOT_ID deploy=$RAILWAY_DEPLOYMENT_ID" > /build-stamp

COPY . .

EXPOSE 5000

CMD gunicorn --workers 2 --bind 0.0.0.0:${PORT:-5000} --timeout 120 --log-level info app:app
