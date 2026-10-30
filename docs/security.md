# QueueLess — Security

## Status: ✅ Phase 9 Complete

---

## Authentication

- Custom session-based auth with bcrypt password hashing
- Email/password registration with role selection (CUSTOMER / SHOP_OWNER)
- Session tokens stored server-side in PostgreSQL with 30-day expiry
- HttpOnly, Secure, SameSite=Lax cookies — never localStorage
- Logout clears session from both cookie and database

## Authorization

- Role-based access: CUSTOMER, SHOP_OWNER, ADMIN
- Server-side role verification on every protected route and server action
- Business membership checks on all owner/staff operations
- Never trust `role` from the client — always re-verify from session
- Middleware checks session cookie presence; full role check happens server-side

## Input Validation

- **Zod schemas** for all API inputs, server actions, and form submissions
- Server-side validation is authoritative; client validation is for UX only
- Comprehensive schema coverage (see `src/lib/validations.ts`):
  - Auth: email, password, phone, register, login
  - Business: create, update, hours, services
  - Booking: appointment, queue join
  - Reviews: rating, comment, booking type
  - Commission: policy creation
  - Search: pagination, filtering, sorting

## Rate Limiting

Rate limiting is implemented at two levels:

### Middleware Layer (Edge)
Applied in `src/middleware.ts` for auth endpoints:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST `/login` | 10 requests | 15 minutes |
| POST `/register` | 10 requests | 15 minutes |

Returns HTTP 429 with `Retry-After` header when exceeded.

### Service Layer
Available via `src/lib/rate-limit.ts` for any server-side operation:

| Use Case | Limit | Window |
|----------|-------|--------|
| `RATE_LIMITS.AUTH` | 10 requests | 15 minutes |
| `RATE_LIMITS.BOOKING` | 20 requests | 1 minute |
| `RATE_LIMITS.API_GENERAL` | 100 requests | 1 minute |
| `RATE_LIMITS.WEBHOOK` | 50 requests | 1 minute |

> **Note**: Current implementation uses in-memory storage. For multi-instance deployments, replace with Redis-backed rate limiting.

## Security Headers

Configured in `next.config.ts`, applied to all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), ...` | Restrict browser features |
| `Content-Security-Policy` | Comprehensive CSP | Prevent XSS, injection |
| `X-DNS-Prefetch-Control` | `on` | Performance optimization |
| `X-Powered-By` | *(removed)* | Hide framework fingerprint |

## Financial Security

- Payment verification via server-side webhook, never client redirect
- Webhook signature validation (HMAC) for Razorpay/Stripe
- **Idempotent** payment processing using provider event ID as dedup key
- WebhookEvent record created *before* processing (crash recovery)
- No raw card details stored — all handled by payment provider
- Commission rates captured as immutable snapshots at booking time
- Refunds create new ledger entries — original records never modified
- All money values stored as integers (paise) to avoid floating-point errors

## Data Protection

- Database credentials stored only in environment variables
- No secrets in client bundles (`NEXT_PUBLIC_` prefix only for safe values)
- Error responses never leak stack traces, SQL queries, or internal details
- Audit logging for all privileged operations (admin actions)
- Data minimization: no customer PII in public queue displays
- Queue status endpoint returns token numbers only (no names/phone numbers)

## Audit Trail

All admin actions are recorded in the `audit_logs` table:

| Field | Description |
|-------|-------------|
| `userId` | Admin who performed the action |
| `action` | Action identifier (e.g., `business.approved`) |
| `entityType` | Entity type (e.g., `Business`, `Review`) |
| `entityId` | ID of the affected entity |
| `details` | JSON with additional context |
| `ipAddress` | Request IP (when available) |
| `createdAt` | Timestamp |

Audited operations include:
- Business verification (approve/reject)
- Commission policy creation
- Review moderation (moderate/unmoderate)
