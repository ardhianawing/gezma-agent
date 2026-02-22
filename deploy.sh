#!/bin/bash
# ============================================
# GEZMA Agent — Deploy ke VPS
# ============================================
# Jalankan di VPS setelah SSH:
#   bash deploy.sh
#
# Sebelum deploy, pastikan .env sudah dibuat
# manual di VPS (lihat .env.example)
# ============================================

set -e

DEPLOY_DIR=~/deployments/gezma-agent
DOMAIN="gezma.ezyindustries.my.id"

echo "=========================================="
echo "  GEZMA Agent — VPS Deployment"
echo "=========================================="

# 1. Install Docker jika belum ada
if ! command -v docker &> /dev/null; then
  echo "[1/8] Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  echo "Docker installed. Jika baru install, logout & login ulang lalu jalankan script ini lagi."
  exit 0
else
  echo "[1/8] Docker sudah ada: $(docker --version)"
fi

# 2. Install Docker Compose plugin jika belum
if ! docker compose version &> /dev/null; then
  echo "[2/8] Installing Docker Compose plugin..."
  sudo apt-get update && sudo apt-get install -y docker-compose-plugin
else
  echo "[2/8] Docker Compose sudah ada: $(docker compose version)"
fi

# 3. Clone atau update repo
echo "[3/8] Setting up repository..."
mkdir -p ~/deployments

if [ -d "$DEPLOY_DIR/.git" ]; then
  echo "  Repo exists, pulling latest..."
  cd $DEPLOY_DIR
  git pull origin master
else
  echo "  Cloning repo..."
  rm -rf $DEPLOY_DIR
  git clone https://github.com/ardhianawing/gezma-agent.git $DEPLOY_DIR
  cd $DEPLOY_DIR
fi

# 4. Check .env file
echo "[4/8] Checking .env..."
if [ ! -f "$DEPLOY_DIR/.env" ]; then
  echo ""
  echo "  ERROR: .env belum ada!"
  echo "  Buat dulu .env di $DEPLOY_DIR berdasarkan .env.example:"
  echo ""
  echo "    cp .env.example .env"
  echo "    nano .env"
  echo ""
  echo "  Lalu jalankan deploy.sh lagi."
  exit 1
fi
echo "  .env found"

# 5. Make start.sh executable
chmod +x $DEPLOY_DIR/start.sh

# 6. Build & run
echo "[5/8] Building Docker images (ini bisa 3-5 menit)..."
cd $DEPLOY_DIR
docker compose down 2>/dev/null || true
docker compose up -d --build

# 7. Wait for healthy
echo "[6/8] Waiting for services to be ready..."
sleep 10

# 8. Setup Nginx reverse proxy + SSL
echo "[7/8] Setting up Nginx + SSL for $DOMAIN..."

# Install nginx & certbot jika belum
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx > /dev/null 2>&1

# Create nginx config
sudo tee /etc/nginx/sites-available/gezma > /dev/null << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/gezma /etc/nginx/sites-enabled/gezma
sudo nginx -t && sudo systemctl reload nginx

# SSL with certbot (auto-redirect HTTP → HTTPS)
echo "  Requesting SSL certificate..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@ezyindustries.my.id --redirect 2>&1 || echo "  SSL setup failed — pastikan DNS A record $DOMAIN sudah pointing ke IP VPS ini"

# Check status
echo "[8/8] Checking services..."
echo ""
docker compose ps
echo ""

# Test the app
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
  echo "=========================================="
  echo "  DEPLOY SUKSES!"
  echo "  https://$DOMAIN"
  echo "=========================================="
else
  echo "App belum ready (HTTP $HTTP_CODE), cek logs:"
  echo "  docker compose logs app"
  echo "  docker compose logs db"
fi

echo ""
echo "Useful commands:"
echo "  docker compose logs -f app    # Lihat log app"
echo "  docker compose logs -f db     # Lihat log database"
echo "  docker compose restart app    # Restart app"
echo "  docker compose down           # Stop semua"
echo "  docker compose up -d --build  # Rebuild & start"
