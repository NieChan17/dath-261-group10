# Production Deployment & Test Account Seeding Guide

This guide documents production deployment, environment hardening, database migrations, and idempotent test account seeding for **EduPulse LMS** (Issue #125).

---

## 1. Prerequisites & Environment Secrets

Before deploying to any `staging` or `production` host:

1. Copy the root template:
   ```bash
   cp .env.example .env
   ```
2. Generate strong cryptographic keys (`>= 32` chars; `backend` refuses to boot in `staging`/`production` without strong secrets):
   ```bash
   openssl rand -hex 32   # use distinct outputs for JWT_SECRET, JWT_REFRESH_SECRET, AI_INTERNAL_TOKEN
   ```
3. Configure strict values in `.env`:
   - `NODE_ENV=production` and `APP_ENV=production`
   - `DB_PASSWORD`: alphanumeric only (avoid `@`, `#`, `/`, `:`, `?` in interpolated URLs)
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`: 64-char hex strings
   - `AI_INTERNAL_TOKEN`: shared secret between `backend` and `rag-service`
   - `CORS_ORIGIN`: exact public frontend URL (e.g., `https://edupulse.example.com`)
   - `COOKIE_SECURE`: `true` when served behind HTTPS (set `false` **only** if testing over plain `http://`)
   - `ENABLE_SWAGGER`: `false` in production

---

## 2. Database Migrations & Idempotent Test Account Seeding

### Commands

Development (from `backend/`):
```bash
npm run db:migrate
npm run db:seed
```

Production container / compiled build (from `backend/`):
```bash
npm run db:migrate:prod   # executes node dist/database/migration.runner.js
npm run db:seed:prod      # executes node dist/database/seed.runner.js
```

> **Note:** In `backend/docker-entrypoint.sh`, setting `RUN_MIGRATIONS_ON_BOOT=true` executes migrations before `node dist/main` starts. Set `RUN_SEED_ON_BOOT=true` on initial provisioning to populate demo accounts idempotently, then set `RUN_SEED_ON_BOOT=false` (or override `SEED_*_PASSWORD` / `DISABLE_DEMO_SEED=true`) once evaluation accounts are verified.

### Seeded Accounts & Demo Dataset

`backend/src/database/seed.runner.ts` runs inside a PostgreSQL transaction using `ON CONFLICT` upserts and Argon2id password hashes (`PasswordService`). It is safe to run repeatedly and updates legacy V009 demo password hashes cleanly.

| Role | Email | Default Password | Override Env Variable |
| :--- | :--- | :--- | :--- |
| `admin` | `admin@edupulse.hcmut.edu.vn` | `Admin@123456` | `SEED_ADMIN_PASSWORD` |
| `instructor` | `instructor@edupulse.hcmut.edu.vn` | `Instructor@123456` | `SEED_INSTRUCTOR_PASSWORD` |
| `instructor` | `linh.instructor@edupulse.hcmut.edu.vn` | `Instructor@123456` | `SEED_INSTRUCTOR_PASSWORD` |
| `student` | `student@edupulse.hcmut.edu.vn` | `Student@123456` | `SEED_STUDENT_PASSWORD` |
| `student` | `hoa.student@edupulse.hcmut.edu.vn` | `Student@123456` | `SEED_STUDENT_PASSWORD` |

Seeded catalog & activity records:
- **Courses:** `CO3103` (Published), `CO3001` (Published), `CS4010` (Published), and `SE4990` (Unpublished draft for instructor/RBAC testing).
- **Content & Activity:** Sections, lessons, checkpoint quiz with questions, student enrollments, lesson progress records, and a sample lesson discussion thread with an instructor reply.

---

## 3. Option A — Self-Hosted Production Docker Compose + Nginx + TLS

Use `docker-compose.prod.yml` on any Linux VPS (Ubuntu 22.04+ with Docker Engine & Docker Compose plugin):

```bash
# 1. Start database, backend, AI RAG service, frontend, and Nginx
docker compose -f docker-compose.prod.yml up -d --build

# 2. Verify container health
docker compose -f docker-compose.prod.yml ps

# 3. Seed demo test accounts on demand (one-off)
docker compose -f docker-compose.prod.yml exec -T backend npm run db:seed:prod
```

### Enabling HTTPS with Let's Encrypt

1. Point your domain DNS `A` record (`DOMAIN_NAME`) to your VPS public IP.
2. Issue the initial certificate via ACME HTTP-01 webroot:
   ```bash
   chmod +x nginx/init-ssl.sh
   DOMAIN_NAME=edupulse.example.com CERTBOT_EMAIL=ops@example.com ./nginx/init-ssl.sh
   ```
3. Uncomment the `listen 443 ssl http2;` block in `nginx/nginx.conf`, update `server_name` and certificate paths, set `COOKIE_SECURE=true` and `CORS_ORIGIN=https://edupulse.example.com` in `.env`, then restart Nginx and backend:
   ```bash
   docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
   docker compose -f docker-compose.prod.yml up -d backend
   ```

---

## 4. Option B — Managed Cloud PaaS (Render Blueprint)

The root `render.yaml` Blueprint defines:
- `edupulse-db` (Managed PostgreSQL with SSL enabled via `DATABASE_SSL=true`)
- `edupulse-backend` (Dockerized NestJS API with auto-generated `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AI_INTERNAL_TOKEN`, `RUN_MIGRATIONS_ON_BOOT=true`, `RUN_SEED_ON_BOOT=true`)
- `edupulse-frontend` (Dockerized Next.js app with `NEXT_PUBLIC_API_URL=/api` and a runtime `/api/[...path]` proxy using `BACKEND_PROXY_URL` so `HttpOnly` `SameSite=Lax` cookies persist cleanly over HTTPS)

Steps:
1. Create a new **Blueprint** in Render connected to the GitHub repository (`main` branch).
2. In the Render Blueprint prompt, enter:
   - `CORS_ORIGIN`: your frontend public HTTPS URL (e.g. `https://edupulse-frontend.onrender.com`)
   - `BACKEND_PROXY_URL`: your backend public HTTPS URL (e.g. `https://edupulse-backend.onrender.com`)
3. Wait for `edupulse-backend` `/api/v1/health` and `edupulse-frontend` `/` health checks to turn green. If Render added a unique suffix to either `.onrender.com` subdomain, update `CORS_ORIGIN` and `BACKEND_PROXY_URL` in each service's **Environment** tab to match the assigned HTTPS URLs.

---

## 5. CI/CD Workflows

| Workflow | Trigger | Purpose |
| :--- | :--- | :--- |
| `.github/workflows/ci.yml` | Push & PR | Frontend domain tests & build, Backend `tsc` + build + Jest tests, Python `compileall`, secret-leak & `npm audit` checks |
| `.github/workflows/deploy-production.yml` | Tag `v*` or manual dispatch | Validates `docker-compose.prod.yml`, tests Nginx config, executes migrations + double seed idempotency run on `pgvector/pgvector:pg16`, runs live API/OWASP/RBAC smoke checks, and triggers Render hooks or VPS SSH deploy if configured |

Optional GitHub Repository Secrets for automated CD:
- **Render:** `RENDER_BACKEND_DEPLOY_HOOK`, `RENDER_FRONTEND_DEPLOY_HOOK`
- **VPS SSH:** `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`, optional `PROD_PORT`, `PROD_DEPLOY_PATH`

---

## 6. Database Backup & Restore Runbook

```bash
# Backup production database to timestamped custom archive
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc > "backup_$(date +%Y%m%d_%H%M%S).dump"

# Restore into target database
cat backup_YYYYMMDD_HHMMSS.dump | docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists
```
