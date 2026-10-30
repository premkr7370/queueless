# QueueLess — Architecture

## Status: ✅ All Phases Complete

---

## Overview

QueueLess is built as a monolithic Next.js application using the App Router pattern with React Server Components (RSC) as the default rendering strategy. It's a commission-based local services marketplace with virtual queue and appointment-booking capabilities.

## Design Principles

1. **Server-first**: All data fetching and mutations happen on the server. Client components are used only for interactivity.
2. **Layered architecture**: Routes → Server Actions → Service Layer → Prisma ORM → Database. Business logic lives in the service layer, not in route handlers.
3. **Type safety**: TypeScript strict mode end-to-end, from database schemas (Prisma) through service interfaces to React components.
4. **Security by default**: Authorization checks happen at the service layer, never solely at the UI level. Rate limiting at the middleware layer.
5. **Testability**: Service layer is designed for dependency injection (mocked Prisma) to enable fast unit testing without a database.

## Directory Structure

```
queueless/
├── docs/                     # Project documentation
│   ├── architecture.md       # This file
│   ├── database.md           # Database schema documentation
│   ├── deployment.md         # Deployment guide
│   ├── security.md           # Security documentation
│   ├── testing.md            # Testing guide
│   ├── payments.md           # Payment integration docs
│   └── api-reference.md      # API reference
├── e2e/                      # Playwright E2E tests
│   ├── homepage.spec.ts
│   ├── auth.spec.ts
│   └── explore.spec.ts
├── prisma/
│   ├── schema.prisma         # Database schema (14 models, 8 enums)
│   └── seed.ts               # Database seed script
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   ├── globals.css       # Design system tokens
│   │   ├── error.tsx         # Error boundary
│   │   ├── not-found.tsx     # 404 page
│   │   ├── login/            # Auth: login
│   │   ├── register/         # Auth: register
│   │   ├── explore/          # Business search & listing
│   │   ├── business/         # Business detail pages
│   │   ├── categories/       # Category pages
│   │   ├── customer/         # Customer dashboard
│   │   │   ├── bookings/     #   - Appointment history
│   │   │   ├── queue/        #   - Queue tickets
│   │   │   └── notifications/#   - Notifications
│   │   ├── owner/            # Owner dashboard
│   │   │   ├── businesses/   #   - Business management
│   │   │   ├── earnings/     #   - Revenue & payments
│   │   │   └── register-business/ # - Onboarding
│   │   ├── admin/            # Admin dashboard
│   │   │   ├── businesses/   #   - Business verification
│   │   │   ├── commission/   #   - Commission policy
│   │   │   ├── reviews/      #   - Review moderation
│   │   │   └── audit/        #   - Audit log
│   │   ├── api/              # API routes
│   │   │   ├── health/       #   - Health check
│   │   │   └── webhooks/     #   - Payment webhooks
│   │   └── (static pages)    # About, Contact, Privacy, Terms, etc.
│   ├── components/           # Reusable UI components
│   │   ├── layout/           # Header, footer, navigation
│   │   ├── marketing/        # Homepage sections
│   │   ├── explore/          # Business cards, search
│   │   ├── auth/             # Auth forms
│   │   └── ui/               # shadcn/ui primitives
│   ├── lib/                  # Shared utilities
│   │   ├── auth.ts           # Server-side auth helpers
│   │   ├── commission.ts     # Commission calculation (integer math)
│   │   ├── constants.ts      # App constants and demo data
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── rate-limit.ts     # Rate limiter utility
│   │   ├── utils.ts          # General utilities
│   │   ├── validations.ts    # Zod schemas
│   │   └── __tests__/        # Unit tests for lib modules
│   ├── server/               # Server-only code
│   │   ├── actions/          # Next.js Server Actions
│   │   └── services/         # Business logic layer
│   │       ├── auth.service.ts
│   │       ├── booking.service.ts
│   │       ├── queue.service.ts
│   │       ├── business.service.ts
│   │       ├── payment.service.ts
│   │       ├── review.service.ts
│   │       ├── notification.service.ts
│   │       ├── audit.service.ts
│   │       └── __tests__/    # Service unit tests
│   └── middleware.ts         # Route protection + rate limiting
├── Dockerfile                # Multi-stage production build
├── .dockerignore             # Docker context exclusions
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright configuration
└── package.json
```

## Rendering Strategy

| Page Type | Rendering | Reason |
|-----------|-----------|--------|
| Homepage | RSC (static) | No user-specific data |
| Business listing | RSC (dynamic) | Database queries |
| Booking form | Client Component | Interactive form state |
| Queue status | Client Component | Realtime subscriptions |
| Dashboard pages | RSC + Client | Mixed data and interaction |
| Admin pages | RSC | Server-side data only |

## Data Flow

1. **Read path**: RSC → Service → Prisma → PostgreSQL
2. **Write path**: Server Action → Validation (Zod) → Service → Prisma → PostgreSQL
3. **Realtime**: Supabase Realtime channel → Client component → Refetch on reconnect
4. **Webhooks**: API Route → Signature validation → Service → Database
5. **Auth**: Cookie → Middleware check → Server-side session lookup → Role verification

## Commission Calculation Flow

```
Booking Created
    ↓
Fetch active CommissionPolicy (server-side)
    ↓
Snapshot rate + base amount into BookingPayment
    ↓
Calculate commission using integer arithmetic (paise)
    ↓
Payment webhook received (idempotent)
    ↓
Create CommissionLedgerEntry
    ↓
On refund → new negative ledger entry (never edit old records)
```

## Security Architecture

```
Request → Middleware (rate limit + session check)
            ↓
         Route Handler (RSC / Server Action)
            ↓
         Auth Helper (requireUser / requireRole)
            ↓
         Zod Validation (input sanitization)
            ↓
         Service Layer (business logic + permissions)
            ↓
         Prisma ORM (parameterized queries)
            ↓
         PostgreSQL (encrypted connection)
```

## Testing Architecture

```
Unit Tests (Vitest, 128 tests, ~700ms)
├── Commission calculation       ← Pure function tests
├── Validation schemas           ← Zod schema tests  
├── Rate limiter                 ← Sliding window tests
└── Service layer tests          ← Mocked Prisma client
    ├── Booking service
    ├── Queue service
    ├── Payment service
    └── Review service

E2E Tests (Playwright, 20+ tests)
├── Homepage                     ← Chromium, Firefox, WebKit, Mobile
├── Authentication               ← Login/register flows
├── Explore                      ← Search, filtering
├── Static pages                 ← All legal pages
└── 404 handling
```
