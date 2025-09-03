### --- FRONTEND BUILD STAGE --- ###
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY ai-document-chat/package.json ai-document-chat/pnpm-lock.yaml ./
COPY ai-document-chat ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile && pnpm build

### --- BACKEND BUILD STAGE --- ####
FROM python:3.11-slim AS backend-builder
WORKDIR /backend
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py ./
COPY .env ./

### --- FINAL STAGE --- ###
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for both FastAPI and Node.js runtime for Next.js
RUN apt-get update && apt-get install -y nodejs npm supervisor && rm -rf /var/lib/apt/lists/*

# Copy backend from builder
COPY --from=backend-builder /backend /app

# Copy frontend build from builder
COPY --from=frontend-builder /frontend/.next /app/ai-document-chat/.next
COPY --from=frontend-builder /frontend/public /app/ai-document-chat/public
COPY --from=frontend-builder /frontend/package.json /app/ai-document-chat/package.json
COPY --from=frontend-builder /frontend/node_modules /app/ai-document-chat/node_modules

# Supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports: 8000 (FastAPI), 3000 (Next.js)
EXPOSE 8000 3000

# Start both FastAPI and Next.js in production mode
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
