#!/bin/bash
# ==============================================================================
# Helper Script: Cấp phát chứng chỉ SSL Let's Encrypt cho EduPulse Staging
# Sử dụng: ./nginx/init-ssl.sh <staging-domain> <admin-email>
# Ví dụ:   ./nginx/init-ssl.sh staging.edupulse.example.com admin@example.com
# ==============================================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Lỗi: Vui lòng cung cấp Domain và Email quản trị."
  echo "Cách dùng: $0 <staging-domain> <admin-email>"
  exit 1
fi

echo "==> 1. Đảm bảo thư mục certbot tồn tại..."
mkdir -p certbot/conf certbot/www

echo "==> 2. Khởi động Nginx để phục vụ ACME challenge..."
docker compose up -d nginx

echo "==> 3. Yêu cầu cấp phát chứng chỉ SSL từ Let's Encrypt..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "==> 4. Cấp phát chứng chỉ thành công cho domain: $DOMAIN!"
echo "Tiếp theo: Hãy bỏ comment khối server 443 trong nginx/nginx.conf, thay your-domain.com bằng $DOMAIN và chạy: docker compose restart nginx"

