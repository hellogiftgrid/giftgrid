#!/usr/bin/env bash
set -euo pipefail

# Run on a fresh Ubuntu ARM VM as a sudo-capable user.
sudo apt-get update
sudo apt-get install -y ca-certificates curl docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo mkdir -p /opt/giftgrid-ai
sudo cp docker-compose.yml nginx.conf /opt/giftgrid-ai/
sudo chown -R "$USER":"$USER" /opt/giftgrid-ai
cd /opt/giftgrid-ai
docker compose up -d
docker exec giftgrid-ollama ollama pull "${LOCAL_AI_MODEL:-qwen2.5:3b}"
echo "AI service is running privately on 127.0.0.1:11434"
