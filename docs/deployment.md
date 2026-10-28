# QueueLess — Deployment Guide

## Status: ✅ Phase 9 Complete

## Deployment Options

### Option 1: Vercel (Recommended for most cases)

Vercel is optimized for Next.js with automatic deployments, edge functions, and preview environments.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Setup Steps:**
1. Connect your GitHub/GitLab repository to Vercel
2. Set all environment variables from `.env.example` in the Vercel dashboard
3. Ensure `DATABASE_URL` points to your production PostgreSQL
4. Run initial migration: `npx prisma migrate deploy`
5. Seed initial data if needed: `npx prisma db seed`

### Option 2: Docker (Self-hosted / Cloud VMs)

QueueLess includes a multi-stage Dockerfile optimized for production.

```bash
# Build the Docker image
docker build -t queueless:latest .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/queueless" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e NODE_ENV=production \
  queueless:latest
```

**Docker Compose (with PostgreSQL):**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/queueless
      - BETTER_AUTH_SECRET=change-me-in-production
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: queueless
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Option 3: Node.js Process (Traditional)

```bash
# Install dependencies
npm ci --omit=dev

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Start
npm run start
```

Use PM2 or systemd for process management in production.

---

## Prerequisites

- **Node.js** >= 20.x (tested with 24.17.0)
- **PostgreSQL** >= 16 (managed: Supabase, Neon, Railway, or self-hosted)
- All environment variables from `.env.example` configured

---

## Database Setup

1. Create a PostgreSQL database
2. Set `DATABASE_URL` in your environment
3. Run migrations: `npx prisma migrate deploy` (use `deploy`, not `dev`, in production)
4. Seed initial data: `npx prisma db seed`
5. Enable connection pooling (PgBouncer) for serverless deployments

---

## Environment Variables Checklist

| Variable | Required | Phase | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | All | Application URL |
| `DATABASE_URL` | Yes | 2+ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | 3+ | Auth session secret (generate with `openssl rand -hex 32`) |
| `RESEND_API_KEY` | Yes | 6+ | Email service API key |
| `PAYMENT_PROVIDER` | Yes | 7+ | `razorpay` or `stripe` |
| `RAZORPAY_KEY_ID` | If Razorpay | 7+ | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | If Razorpay | 7+ | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | If Razorpay | 7+ | Webhook signing secret |
| `DEFAULT_COMMISSION_RATE_PERCENT` | Yes | 7+ | Default commission rate (e.g., 10) |
| `DEFAULT_CURRENCY` | Yes | 7+ | Currency code (e.g., `INR`) |

---

## Health Check

The application exposes a health check endpoint at:

```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-23T09:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "environment": "production",
  "database": "connected",
  "responseTimeMs": 5
}
```

Used by Docker HEALTHCHECK and can be configured in load balancers.

---

## Backup Strategy

- Daily automated backups via managed database provider
- Point-in-time recovery (PITR) enabled
- Test restore procedures quarterly
- Keep Prisma migration history in version control

---

## Monitoring Recommendations

| Area | Tool |
|------|------|
| Web vitals | Vercel Analytics or web-vitals library |
| Error tracking | Sentry |
| Uptime monitoring | UptimeRobot, Pingdom, or AWS CloudWatch |
| Database performance | pg_stat_statements, managed provider dashboards |
| Application logs | stdout (Docker) → CloudWatch / Datadog / Loki |

---

## Security Checklist (Production)

- [x] All secrets stored in environment variables (never in code)
- [x] HTTPS enforced via reverse proxy or hosting platform
- [x] CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers configured
- [x] Rate limiting on auth endpoints (10 req / 15 min per IP)
- [x] `X-Powered-By` header removed (framework fingerprint hidden)
- [x] Database connection encrypted (SSL)
- [x] Webhook endpoints secured with HMAC signature verification
- [x] Admin routes protected with server-side role checks
- [x] Audit logging for privileged operations
- [x] Input validation with Zod on all server actions
- [x] No sensitive data in error responses
- [x] Session cookies: HttpOnly, Secure, SameSite=Lax

---

## Scaling Considerations

| Load Level | Approach |
|-----------|----------|
| < 1,000 users | Single instance (Vercel, Railway, or Docker) |
| 1,000–10,000 | Vercel (auto-scales), or 2–3 Docker instances behind a load balancer |
| 10,000+ | Replace in-memory rate limiter with Redis, add read replicas for DB |
