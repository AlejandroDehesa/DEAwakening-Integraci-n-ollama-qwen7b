# Security Baseline for Railway Deployment

This project includes a lightweight security hardening layer ready for Railway.

## What is enforced

- Strict admin key validation using constant-time comparison (`x-admin-key`).
- CORS allowlist (`CORS_ALLOWED_ORIGINS` and/or `FRONTEND_URL` in production).
- Basic security headers (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS` on HTTPS, etc.).
- Request constraints:
  - URL length cap
  - JSON requirement for write requests
  - Body size cap (`100kb`)
- Route-level rate limiting:
  - Global `/api`
  - `/api/contact`
  - `/api/events/:id/register`
  - `/api/assistant/chat`
  - `/api/admin/*`
- Safe API 404 response and controlled error responses.

## Required Railway environment variables

- `NODE_ENV=production`
- `PORT` (Railway usually injects this automatically)
- `ADMIN_KEY` (required)
- `CORS_ALLOWED_ORIGINS` (comma-separated frontend origins)
- Optional: `FRONTEND_URL` (single frontend origin)

Assistant + email variables remain required as already documented:
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, etc.
- SMTP and contact variables for contact email delivery.

## Frontend admin security note

Admin key is no longer expected to be hardcoded in production frontend build.

- Admin pages ask for the key at runtime and store it in `sessionStorage`.
- `VITE_ADMIN_KEY` remains optional for local development only.

## Quick production checklist

1. Set Railway backend vars (`ADMIN_KEY`, `CORS_ALLOWED_ORIGINS`, assistant + SMTP vars).
2. Set frontend `VITE_API_BASE_URL` to your backend Railway URL (or use same-origin setup).
3. Verify:
   - `/api/status` responds
   - CORS is accepted only for allowed origins
   - Admin routes return `401` without `x-admin-key`
   - Contact and assistant endpoints are reachable and rate-limited

## Secrets handling (minimal policy)

- Real `.env` files are not versioned in this repository.
- Copy `backend/.env.example` and `frontend/.env.example` to local `.env` files and fill values locally/in platform secrets.
- Any previously exposed credentials must be rotated outside the codebase (API keys, SMTP password, admin key).
