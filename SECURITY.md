# Security Hardening & OWASP Top 10 Audit Report

This document summarizes the OWASP Top 10:2021 security audit, threat remediations, and ongoing verification controls implemented across the **EduPulse LMS** backend, frontend, reverse proxy, containers, and CI/CD pipelines (Issue #124).

---

## 1. Threat Model & Scope

| Component | Stack | Exposure |
| :--- | :--- | :--- |
| Reverse Proxy (`nginx`) | Nginx 1.25 Alpine | Public (`80/tcp`, `443/tcp`) |
| Frontend Web App (`frontend`) | Next.js 14.2.35 (App Router) | Proxied via Nginx `/` or PaaS Edge |
| Core API (`backend`) | NestJS 10 + PostgreSQL `pg` + Argon2id | Proxied via Nginx `/api/` |
| AI RAG Service (`rag-service`) | FastAPI + Python 3.12 + pgvector | Internal Docker network (`X-Internal-Token`), `/rag/` only |
| PostgreSQL (`postgres`) | `pgvector/pgvector:pg16` | Internal network / `127.0.0.1` only |

---

## 2. OWASP Top 10:2021 Audit Findings & Remediations

### A01 — Broken Access Control
1. **Public Admin Self-Registration Blocked**
   - *Finding:* Public registration DTO previously risked privilege escalation if arbitrary roles were supplied.
   - *Remediation:* Restricted `RegisterDto` to `SELF_REGISTER_ROLES = [Role.STUDENT, Role.INSTRUCTOR]` in `backend/src/modules/auth/dto/register.dto.ts` and enforced a service-layer `ForbiddenException` in `backend/src/modules/auth/auth.service.ts`. Verified via `auth.service.spec.ts` and production CD smoke tests.
2. **IDOR Prevention on User & Assignment Endpoints**
   - *Finding:* User profile lookups and submission file downloads required stricter object-level authorization.
   - *Remediation:* `UsersService.findById` verifies `currentUser.role === Role.ADMIN || currentUser.userId === id`. `AssignmentsService` verifies file download ownership/instructor scope (`verifyFileDownloadAccess`) and sends `Content-Disposition: attachment` alongside `X-Content-Type-Options: nosniff`.
3. **Frontend Workspace & Admin Route Guards**
   - *Finding:* Admin/Instructor navigation and layout checks cannot rely solely on client-side `localStorage`.
   - *Remediation:* Added `frontend/src/components/auth/workspace-guard.tsx` and applied server-verified `/v1/auth/me` session guards in `frontend/src/app/admin/layout.tsx`, `frontend/src/app/instructor/layout.tsx`, and `frontend/src/app/portal/page.tsx`.
4. **Reverse Proxy Internal RAG Route Isolation**
   - *Finding:* Direct exposure of ingestion and audit endpoints on `/rag/` creates unauthorized mutation risk.
   - *Remediation:* `nginx/nginx.conf` explicitly blocks `/rag/(ingest|materials|review)` with HTTP `403`.

### A02 — Cryptographic Failures & Secrets Management
1. **Fail-Fast JWT Secret Validation**
   - *Remediation:* `backend/src/common/config/security.config.ts` (`getJwtSecrets`) refuses startup in `production` or `staging` if `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing, shorter than 32 characters, matches known sample keys, or uses a `CHANGE_ME*` placeholder.
2. **Argon2id Password Hashing & Legacy Seed Upgrade**
   - *Remediation:* `PasswordService` hashes passwords with Argon2id (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 1`). Running `backend/src/database/seed.runner.ts` upgrades legacy V009 demo hashes into Argon2id hashes aligned with role credentials.
3. **HttpOnly Session Cookies**
   - *Remediation:* Tokens are issued as `HttpOnly`, `SameSite=Lax` cookies. `isCookieSecure()` defaults `Secure=true` in `production` (overrideable via `COOKIE_SECURE=false` for local HTTP integration tests).
   - *PaaS Note:* `frontend/next.config.mjs` supports `BACKEND_PROXY_URL` to proxy `/api/*` same-origin so `SameSite=Lax` `HttpOnly` cookies work cleanly without downgrading to `SameSite=None`.
4. **Repository Secret Hygiene**
   - *Remediation:* Removed sample secret literals from `.env.example` and `backend/.env.example`, keeping `.env` ignored in `.gitignore` and enforced by the `security-audit` job in `.github/workflows/ci.yml`.

### A03 — Injection
1. **Parameterized SQL Queries**
   - All PostgreSQL queries across backend services use `$1..$N` bind parameters via `DatabaseService`.
2. **SQL LIKE/ILIKE Wildcard Escaping**
   - `escapeLikePattern()` with `ESCAPE '\'` in `users.service.ts` and `courses.service.ts` prevents `%` / `_` wildcard abuse in search queries, backed by `PaginationQueryDto` length bounds (`@MaxLength(120)`).

### A04 — Insecure Design & Brute Force Protection
1. **Multi-Layer Rate Limiting**
   - **Backend (`@nestjs/throttler`):** Global `ThrottlerGuard` (`120` requests / `60000ms`), tightened via `@Throttle` on `/api/v1/auth/login` and `/api/v1/auth/register` (`10` req / `60s`) and `/api/v1/auth/refresh` (`20` req / `60s`). `/api/v1/health` uses `@SkipThrottle()` for orchestrator probes.
   - **Nginx Edge:** `limit_req_zone` (`auth_limit: 10r/m`, `burst=5 nodelay`; `api_limit: 30r/s`, `burst=40 nodelay`) returning HTTP `429`.

### A05 — Security Misconfiguration
1. **HTTP Headers & Information Disclosure Controls**
   - Backend uses `helmet` with CSP (`defaultSrc: ['self']`, `frameAncestors: ['self']`), HSTS enabled in `production`/`staging`, and `app.getHttpAdapter().getInstance().disable('x-powered-by')`.
   - Nginx sets `server_tokens off`, `proxy_hide_header X-Powered-By`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`.
   - Next.js configures `poweredByHeader: false`, `images: { unoptimized: true }`, and equivalent response security headers.
2. **Strict Input Validation & CORS Allowlist**
   - `ValidationPipe` enforces `whitelist: true` and `forbidNonWhitelisted: true`.
   - `isOriginAllowed()` enforces an explicit comma-separated `CORS_ORIGIN` allowlist outside `development`, rejecting disallowed browser origins with HTTP `403` (`ForbiddenException`).
3. **Production Error Masking & Swagger Lockdown**
   - `AllExceptionsFilter` hides internal `Error.message` strings on unhandled HTTP `500` errors when `isStrictEnvironment(NODE_ENV)` is true.
   - Swagger UI (`/api/docs`) is disabled in `production`/`staging` unless `ENABLE_SWAGGER=true`.
4. **Hardened Container Execution (`docker-compose.prod.yml`)**
   - Backend runs as non-root `appuser`; frontend runs as non-root `nextjs`.
   - Production services set `no-new-privileges:true`, `cap_drop: [ALL]` (on application containers), resource memory limits, log rotation, and internal-only PostgreSQL/AI networking.

### A06 — Vulnerable and Outdated Components
- Installed `helmet` and `@nestjs/throttler` and ran `npm audit fix` across `backend/` and `frontend/`.
- Upgraded Next.js (`14.2.5` -> `14.2.35`) to resolve the Next.js middleware authorization bypass advisory (`GHSA-f82v-jwr5-mffw`).
- Remaining upstream `npm audit` findings in `frontend/` requiring Next.js major upgrade (`next` 16.x Image Optimizer / RSC advisories and `postcss`) are mitigated because Next.js runtime image optimization is disabled (`images: { unoptimized: true }`) and the application does not use React Server Actions. Track a planned major Next.js upgrade post-capstone.

### A07 — Identification & Authentication Failures
- Enforced password complexity (`>= 8` chars, `<= 128` chars, uppercase + lowercase + digit) on registration in both `RegisterDto` and `frontend/src/app/register/page.tsx`.
- Portal and header UI hydrate active user identity directly from `/api/v1/auth/me`.

### A08 / A09 / A10 — Integrity, Logging & SSRF
- External avatar and submission link DTOs validate `http://` or `https://` protocol schemes.
- Failed upload validations clean up temporary disk files (`cleanupTempUpload` in `assignments.service.ts`).
- CI workflow (`.github/workflows/ci.yml`) runs committed-secret checks alongside dependency audits on every push/PR.

---

## 3. Residual Architectural Notes

1. **Vector Table Naming Alignment:** Backend SQL migrations define `material_embeddings` and `query_audit_logs` (plural), whereas `service/ai-service` queries `material_embedding` and `query_audit_log` (singular). Keep both documented until schema consolidation is scheduled with the AI track.
2. **TLS Termination Setup:** `nginx/nginx.conf` ships with HTTP (`80`) enabled out of the box and an HTTPS (`443`) server block ready to uncomment after issuing certificates via `nginx/init-ssl.sh`.

---

## 4. Reporting Security Issues

Do not open public issues with exploit payloads or credentials. Report security concerns privately to the repository maintainers with reproduction steps and affected component versions.
