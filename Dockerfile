# Multi-stage Dockerfile for AI Design Studio

# Stage 1: Node.js Backend
FROM node:16-alpine AS backend
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server code
COPY server/ ./server/
COPY app/ ./app/
COPY index.html ./

EXPOSE 3000

# Stage 2: Python AI Service
FROM python:3.9-slim AS ai-service
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy AI service code
COPY ai-service/ ./ai-service/

# Download SAM model (optional, can be done at runtime)
# RUN wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth

EXPOSE 5000

# Final stage: Combined image
FROM node:16-alpine
WORKDIR /app

# Install Python
RUN apk add --no-cache python3 py3-pip

# Copy from backend stage
COPY --from=backend /app /app

# Copy from AI service stage
COPY --from=ai-service /app/ai-service /app/ai-service
COPY --from=ai-service /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

# Create data directories
RUN mkdir -p data/projects data/uploads data/generated

# Expose ports
EXPOSE 3000 5000

# Start script
COPY scripts/docker-start.sh /app/
RUN chmod +x /app/docker-start.sh

CMD ["/app/docker-start.sh"]
