FROM python:3.11-slim

# System deps (git for later repo cloning, curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Install slither + solc-select
RUN pip install --no-cache-dir slither-analyzer solc-select fastapi uvicorn

# Install a stable solc version
RUN solc-select install 0.8.20 && solc-select use 0.8.20

WORKDIR /app

COPY app /app/app
COPY scripts /app/scripts

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
