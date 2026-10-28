# QueueLess

> **Find your service. Book your spot. Skip the wait.**

QueueLess is a commission-based local services marketplace with a real-time virtual queue and appointment-booking system. It connects customers with local service businesses — clinics, salons, spas, diagnostic centers, repair shops, and more.

![Status](https://img.shields.io/badge/status-Phase%209%20Complete-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Problem Statement

Customers waste hours in physical queues at local businesses. Businesses lose customers who leave due to long waits. There's no unified platform for discovering local services, booking appointments, and tracking queue positions in real time.

QueueLess solves this by providing:

- **For Customers**: Service discovery, appointment booking, walk-in queue tokens, and real-time queue tracking
- **For Business Owners**: Online listings, service management, staff and queue controls, booking analytics, and earnings reports
- **For Platform Admins**: Business verification, commission management, financial reconciliation, and moderation tools

---

# QueueLess — Complete Documentation

> **Find your service. Book your spot. Skip the wait.**

---

## Table of Contents

1. [Overview](#overview)
2. [Demo Login Credentials](#demo-login-credentials)
3. [Quick Start Guide](#quick-start-guide)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Authentication System](#authentication-system)
8. [API Reference](#api-reference)
9. [Server Actions](#server-actions)
10. [Service Layer](#service-layer)
11. [Commission & Payments](#commission--payments)
12. [Queue System](#queue-system)
13. [Role-Based Access Control](#role-based-access-control)
14. [Security](#security)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Environment Variables](#environment-variables)
18. [Troubleshooting](#troubleshooting)

---

## Overview

QueueLess is a commission-based local services marketplace with a real-time virtual queue and appointment-booking system built with:

| Layer          | Technology                |
| -------------- | ------------------------- |
| Framework      | Next.js 16 (App Router)   |
| Language       | TypeScript (strict mode)  |
| UI             | React 19.3                |
| Styling        | Tailwind CSS 4            |
| Components     | shadcn/ui + Lucide Icons  |
| Database       | PostgreSQL 16+            |
| ORM            | Prisma 7                  |
| Validation     | Zod 4                     |
| Unit Tests     | Vitest 5                  |
| E2E Tests      | Playwright                |
| Container      | Docker (multi-stage)      |

---

## Demo Login Credentials

After running the database seed (`npm run db:seed`), the following demo accounts are available:

### Admin Account

| Field    | Value                              |
| -------- | ---------------------------------- |
| Email    | `admin@queueless.example.com`      |
| Password | `admin123`                         |
| Role     | `ADMIN`                            |
| Name     | QueueLess Admin                    |
| URL      | http://localhost:3000/login then redirects to `/admin` |

**What you can do as Admin:**
- View platform-wide stats (total users, businesses, appointments, queue tickets, payments)
- View total platform commission revenue
- Verify/reject businesses (Admin > Businesses)
- Configure commission policies (Admin > Commission)
- Moderate user reviews (Admin > Reviews)
- View audit logs of all privileged actions (Admin > Audit Log)
- Process refunds

---

### Shop Owner Account

| Field    | Value                              |
| -------- | ---------------------------------- |
| Email    | `owner@queueless.example.com`      |
| Password | `owner123`                         |
| Role     | `SHOP_OWNER`                       |
| Name     | Dr. Priya Sharma                   |
| Phone    | +919876543210                      |
| URL      | http://localhost:3000/login then redirects to `/owner` |

**What you can do as Owner:**
- View dashboard with stats (businesses, appointments, queue tickets, reviews)
- Manage registered businesses (Sunrise Health Clinic, Elite Cuts Salon)
- Register new businesses
- Manage queue (call next, start serving, complete ticket)
- View earnings and payment history
- Update business details, services, and hours

**Pre-seeded Businesses:**

| Business             | Category    | City      | Services                                    |
| -------------------- | ----------- | --------- | -------------------------------------------- |
| Sunrise Health Clinic | Healthcare  | Bangalore | General Consultation (Rs.500), Pediatric (Rs.800) |
| Elite Cuts Salon     | Salon & Spa | Bangalore | Haircut - Men (Rs.400), Hair Coloring (Rs.2,500) |

---

### Customer Account

| Field    | Value                              |
| -------- | ---------------------------------- |
| Email    | `customer@queueless.example.com`   |
| Password | `customer123`                      |
| Role     | `CUSTOMER`                         |
| Name     | Rahul Patel                        |
| Phone    | +919123456789                      |
| URL      | http://localhost:3000/login then redirects to `/customer/bookings` |

**What you can do as Customer:**
- Browse and search businesses (Explore page)
- View business details, services, hours, and reviews
- Book appointments with specific time slots
- Join walk-in queues and get digital tokens
- Track queue position in real time
- View all bookings and queue tickets
- Submit reviews for completed bookings
- View notifications

---

## Quick Start Guide

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x
- **PostgreSQL** >= 16 (or a Neon/Supabase managed instance)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd queueless

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to database (or run migrations)
npm run db:push
# OR for tracked migrations:
npm run db:migrate

# 6. Seed the database with demo data
npm run db:seed

# 7. Start the development server
npm run dev
```

Visit http://localhost:3000

### Login Flow

1. Go to http://localhost:3000/login
2. Enter any demo email/password from the table above
3. You will be redirected to the appropriate dashboard based on your role

### Available npm Scripts

| Script               | Command                | Description                          |
| -------------------- | ---------------------- | ------------------------------------ |
| `dev`                | `npm run dev`          | Start development server             |
| `build`              | `npm run build`        | Production build                     |
| `start`              | `npm run start`        | Start production server              |
| `lint`               | `npm run lint`         | Run ESLint                           |
| `test`               | `npm run test`         | Run unit tests (Vitest)              |
| `test:watch`         | `npm run test:watch`   | Run tests in watch mode              |
| `test:coverage`      | `npm run test:coverage`| Run tests with coverage              |
| `test:e2e`           | `npm run test:e2e`     | Run E2E tests (Playwright)           |
| `test:e2e:ui`        | `npm run test:e2e:ui`  | E2E tests with Playwright UI         |
| `test:e2e:install`   | `npm run test:e2e:install` | Install Playwright browsers      |
| `db:generate`        | `npm run db:generate`  | Generate Prisma client               |
| `db:migrate`         | `npm run db:migrate`   | Run Prisma migrations                |
| `db:push`            | `npm run db:push`      | Push schema to DB (no migration)     |
| `db:seed`            | `npm run db:seed`      | Seed database with demo data         |
| `db:studio`          | `npm run db:studio`    | Open Prisma Studio (DB GUI)          |

---

## Architecture

### High-Level Architecture

```
+-------------------------------------------------------------+
|                     Client Browser                           |
|  +------------------------------------------------------+   |
|  |  Next.js React Components (RSC + Client Components)  |   |
|  +------------------------------------------------------+   |
+-------------------------------------------------------------+
                  |                      |
                  v                      v
+-------------------------------------------------------------+
|                    Next.js Server                            |
|  +------------+  +------------+  +----------------------+   |
|  |   Server   |  |   Server   |  |    API Routes        |   |
|  | Components |  |  Actions   |  |  (Webhooks, Health)  |   |
|  +------+-----+  +------+-----+  +----------+-----------+   |
|         |               |                    |               |
|         v               v                    v               |
|  +------------------------------------------------------+   |
|  |               Auth Middleware (Proxy)                  |   |
|  +------------------------------------------------------+   |
|                         |                                    |
|  +------------------------------------------------------+   |
|  |              Service Layer (Business Logic)           |   |
|  |  auth - business - booking - queue - payment - review |   |
|  |  notification - audit                                 |   |
|  +------------------------------------------------------+   |
+-------------------------------------------------------------+
                          |
                          v
              +-----------------------+
              |   Prisma ORM Client   |
              +-----------+-----------+
                          |
                          v
              +-----------------------+
              |     PostgreSQL DB     |
              +-----------------------+
```

### Request Flow

1. **Browser** sends request to Next.js server
2. **Middleware** checks for session cookie on protected routes (`/customer/*`, `/owner/*`, `/admin/*`)
3. **Server Components** call service layer directly; **Client Components** call Server Actions
4. **Service Layer** performs business logic and database operations via Prisma
5. **Response** returned to browser (RSC payload or JSON for actions)

### Key Design Decisions

- **Server Components by default** - client components only when interactivity is needed (forms, menus)
- **Server Actions** - all mutations go through `"use server"` actions with Zod validation
- **Service Layer** - business logic separated from actions/routes for testability
- **Integer currency** - all money stored in paise (minor currency units) to avoid floating-point errors
- **Immutable financial records** - commission snapshots and ledger entries are never retroactively modified

---

## Project Structure

```
queueless/
├── prisma/
│   ├── schema.prisma          # Database schema (17 models, 8 enums)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with Inter font
│   │   ├── page.tsx           # Homepage with 8 marketing sections
│   │   ├── globals.css        # Tailwind + design tokens (indigo theme)
│   │   ├── login/page.tsx     # Login page
│   │   ├── register/page.tsx  # Registration page
│   │   ├── admin/             # Admin dashboard (layout + 4 sub-pages)
│   │   │   ├── layout.tsx     # Admin sidebar + role guard
│   │   │   ├── page.tsx       # Platform stats overview
│   │   │   ├── businesses/    # Business verification
│   │   │   ├── commission/    # Commission policy management
│   │   │   ├── reviews/       # Review moderation
│   │   │   └── audit/         # Audit log viewer
│   │   ├── owner/             # Shop owner dashboard
│   │   │   ├── layout.tsx     # Owner sidebar + role guard
│   │   │   ├── page.tsx       # Owner stats + business list
│   │   │   ├── businesses/    # Individual business management
│   │   │   ├── earnings/      # Revenue & payment history
│   │   │   └── register-business/ # New business onboarding
│   │   ├── customer/          # Customer dashboard
│   │   │   ├── layout.tsx     # Customer sidebar
│   │   │   ├── bookings/      # Appointment list
│   │   │   ├── queue/         # Active queue tickets
│   │   │   └── notifications/ # Notification inbox
│   │   ├── explore/           # Business search & discovery
│   │   ├── categories/        # Category detail pages
│   │   ├── api/
│   │   │   ├── health/        # GET /api/health
│   │   │   └── webhooks/
│   │   │       └── payment/   # POST /api/webhooks/payment
│   │   └── (static pages)     # about, contact, privacy, terms, etc.
│   ├── components/
│   │   ├── auth/              # LoginForm, RegisterForm
│   │   ├── explore/           # BusinessCard, SearchFilters, Pagination
│   │   ├── layout/            # Header, Footer, UserMenu
│   │   ├── marketing/         # Homepage sections (8 components)
│   │   └── ui/                # shadcn/ui primitives
│   ├── lib/
│   │   ├── auth.ts            # getCurrentUser(), requireUser(), requireRole()
│   │   ├── commission.ts      # calculateCommission(), formatCurrency()
│   │   ├── constants.ts       # Categories, featured businesses, FAQ data
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── rate-limit.ts      # Sliding-window rate limiter
│   │   ├── utils.ts           # cn() utility (class merge)
│   │   └── validations.ts     # All Zod schemas & types
│   ├── middleware.ts           # Route protection + rate limiting
│   └── server/
│       ├── actions/            # "use server" action handlers
│       │   ├── auth.actions.ts
│       │   ├── admin.actions.ts
│       │   ├── booking.actions.ts
│       │   ├── business.actions.ts
│       │   ├── notification.actions.ts
│       │   ├── payment.actions.ts
│       │   └── review.actions.ts
│       └── services/           # Business logic layer
│           ├── auth.service.ts
│           ├── audit.service.ts
│           ├── booking.service.ts
│           ├── business.service.ts
│           ├── notification.service.ts
│           ├── payment.service.ts
│           ├── queue.service.ts
│           ├── review.service.ts
│           └── index.ts
├── e2e/                        # Playwright E2E tests
├── docs/                       # Additional documentation
├── public/                     # Static assets
├── Dockerfile                  # Multi-stage Docker build
├── next.config.ts              # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## Database Schema

### Models Summary

| Model                    | Table Name                | Key Fields                                           |
| ------------------------ | ------------------------- | ---------------------------------------------------- |
| `User`                   | `users`                   | email, role (CUSTOMER/SHOP_OWNER/ADMIN)              |
| `Session`                | `sessions`                | userId, token, expiresAt                             |
| `Category`               | `categories`              | slug, name, icon (Lucide icon name)                  |
| `Business`               | `businesses`              | slug, categoryId, verificationStatus                 |
| `BusinessMembership`     | `business_memberships`    | userId, businessId, role (OWNER/MANAGER/STAFF)       |
| `Service`                | `services`                | businessId, durationMinutes, priceAmount (paise)     |
| `BusinessHours`          | `business_hours`          | businessId, dayOfWeek, openTime, closeTime           |
| `Appointment`            | `appointments`            | businessId, serviceId, customerId, date, startTime   |
| `QueueCounter`           | `queue_counters`          | businessId, date, lastTokenNumber                    |
| `QueueTicket`            | `queue_tickets`           | tokenNumber, status, estimatedWaitMinutes            |
| `BookingPayment`         | `booking_payments`        | grossAmountPaise, commissionAmountPaise               |
| `CommissionPolicy`       | `commission_policies`     | ratePercent, minAmountPaise, maxAmountPaise           |
| `CommissionLedgerEntry`  | `commission_ledger_entries`| bookingPaymentId, type (COMMISSION/REFUND_ADJUSTMENT) |
| `Review`                 | `reviews`                 | businessId, customerId, rating (1-5)                 |
| `Notification`           | `notifications`           | userId, type, title, body, isRead                    |
| `AuditLog`               | `audit_logs`              | userId, action, entityType, entityId                 |
| `WebhookEvent`           | `webhook_events`          | provider, eventId (unique), processedAt              |

### Enums

| Enum                 | Values                                            |
| -------------------- | ------------------------------------------------- |
| `UserRole`           | CUSTOMER, SHOP_OWNER, ADMIN                       |
| `VerificationStatus` | PENDING, APPROVED, REJECTED                       |
| `MembershipRole`     | OWNER, MANAGER, STAFF                             |
| `AppointmentStatus`  | CONFIRMED, COMPLETED, CANCELLED, NO_SHOW          |
| `QueueTicketStatus`  | WAITING, CALLED, SERVING, COMPLETED, CANCELLED, NO_SHOW |
| `PaymentStatus`      | PENDING, CAPTURED, REFUNDED, FAILED               |
| `LedgerEntryType`    | COMMISSION, REFUND_ADJUSTMENT                     |
| `NotificationType`   | QUEUE_UPDATE, APPOINTMENT_REMINDER, BOOKING_CONFIRMATION, BOOKING_CANCELLATION, SYSTEM |

---

## Authentication System

### How It Works

1. **Registration**: User submits email/password/name via `RegisterForm` -> `registerAction` -> `registerUser` service
2. **Password Hashing**: SHA-256 with a salt (`password + "queueless_salt"`)
3. **Login**: Email/password verified -> Session created (30-day expiry) -> `session_token` cookie set
4. **Session Check**: `getCurrentUser()` reads cookie -> looks up session in DB -> returns user
5. **Logout**: Session deleted from DB -> cookie removed -> redirect to home

### Auth Helper Functions (src/lib/auth.ts)

| Function         | Returns              | Description                           |
| ---------------- | -------------------- | ------------------------------------- |
| `getCurrentUser()` | `SessionUser or null` | Get current user from session cookie  |
| `requireUser()`   | `SessionUser`        | Like above but redirects to `/login` if not authenticated |
| `requireRole(...roles)` | `SessionUser`  | Requires specific role(s) or redirects to `/` |

### Session Cookie Configuration

| Property   | Value                              |
| ---------- | ---------------------------------- |
| Name       | `session_token`                    |
| HttpOnly   | `true`                             |
| Secure     | `true` in production               |
| SameSite   | `lax`                              |
| Expires    | 30 days from login                 |
| Path       | `/`                                |

---

## API Reference

### GET /api/health

Health check endpoint for load balancers and monitoring.

**Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-26T08:00:00.000Z",
  "uptime": 12345.678,
  "version": "0.1.0",
  "environment": "development",
  "database": "connected",
  "responseTimeMs": 15
}
```

### POST /api/webhooks/payment

Payment webhook endpoint (Razorpay/Stripe). Processes payment events idempotently.

**Headers**:
- `x-provider`: `"razorpay"` or `"stripe"` (default: `"razorpay"`)

**Body (Razorpay)**:
```json
{
  "event_id": "evt_123",
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "order_id": "order_123"
      }
    }
  }
}
```

**Response (200)**:
```json
{ "status": "captured" }
```

Possible status values: `captured`, `already_processed`, `payment_not_found`, `unhandled_event_type`, `error_recorded`

---

## Server Actions

All server actions use the `"use server"` directive and follow the pattern:

```typescript
export async function actionName(formData: FormData): Promise<ActionResult> {
  // 1. Authenticate user
  // 2. Validate input with Zod
  // 3. Call service layer
  // 4. Return { success, error?, data? }
}
```

### Auth Actions (auth.actions.ts)

| Action             | Input                  | Description                    |
| ------------------ | ---------------------- | ------------------------------ |
| `registerAction`   | FormData (email, password, name, phone?, role) | Register new user |
| `loginAction`      | FormData (email, password) | Login and set session cookie |
| `logoutAction`     | None                   | Delete session and redirect    |

### Booking Actions (booking.actions.ts)

| Action                    | Input                           | Description                    |
| ------------------------- | ------------------------------- | ------------------------------ |
| `joinQueueAction`         | FormData (businessId, serviceId) | Join walk-in queue             |
| `callNextAction`          | businessId                      | Call next person (staff only)  |
| `startServingAction`      | ticketId                        | Start serving customer (staff) |
| `completeTicketAction`    | ticketId                        | Mark ticket complete (staff)   |
| `createAppointmentAction` | FormData (businessId, serviceId, date, startTime, notes?) | Book appointment |
| `cancelAppointmentAction` | appointmentId                   | Cancel appointment             |

### Business Actions (business.actions.ts)

| Action                    | Input                           | Description                    |
| ------------------------- | ------------------------------- | ------------------------------ |
| `createBusinessAction`    | FormData (name, address, city, state, pincode, categoryId, ...) | Register new business |
| `updateBusinessAction`    | (businessId, FormData)          | Update business details        |
| `searchBusinessesAction`  | { q?, category?, city?, page?, limit?, sortBy? } | Search businesses |
| `getBusinessBySlugAction` | slug                            | Get business by URL slug       |
| `getOwnerBusinessesAction`| None                            | Get owner's businesses         |

### Admin Actions (admin.actions.ts)

| Action                          | Input                          | Description                    |
| ------------------------------- | ------------------------------ | ------------------------------ |
| `getBusinessesForVerificationAction` | None                      | List all businesses            |
| `verifyBusinessAction`          | (businessId, status, note?)    | Approve/reject business        |
| `getCommissionPoliciesAction`   | None                           | List commission policies       |
| `createCommissionPolicyAction`  | FormData                       | Create new policy              |
| `getAdminStatsAction`           | None                           | Get platform statistics        |
| `getAuditLogsAction`            | limit?                         | Get audit log entries          |
| `moderateReviewAction`          | (reviewId, moderated)          | Moderate a review              |

### Payment Actions (payment.actions.ts)

| Action                           | Input        | Description                    |
| -------------------------------- | ------------ | ------------------------------ |
| `createAppointmentPaymentAction` | appointmentId | Create payment for appointment |
| `createQueuePaymentAction`       | queueTicketId | Create payment for queue ticket |
| `processRefundAction`            | (paymentId, reason) | Process refund (admin)  |
| `getCommissionSummaryAction`     | None         | Get commission summary (admin) |

### Notification Actions (notification.actions.ts)

| Action                  | Input          | Description                    |
| ----------------------- | -------------- | ------------------------------ |
| `getNotificationsAction`| None           | Get user's notifications       |
| `markReadAction`        | notificationId | Mark single notification read  |
| `markAllReadAction`     | None           | Mark all notifications read    |

### Review Actions (review.actions.ts)

| Action                      | Input                      | Description                    |
| --------------------------- | -------------------------- | ------------------------------ |
| `createReviewAction`        | FormData (businessId, bookingId, bookingType, rating, comment?) | Submit review |
| `getBusinessReviewsAction`  | (businessId, limit?, offset?) | Get business reviews        |

---

## Service Layer

All business logic lives in `src/server/services/`. Each service module exports pure functions that take validated input and return results or throw errors.

### Auth Service (auth.service.ts)

- `registerUser(input)` - Create user with hashed password
- `loginUser(input)` - Verify credentials, create session, return token
- `getSessionUser(token)` - Lookup session by token
- `logoutUser(token)` - Delete session

### Business Service (business.service.ts)

- `createBusiness(ownerId, input)` - Create business + membership + default hours (in transaction)
- `updateBusiness(businessId, userId, input)` - Update with membership verification
- `getBusinessBySlug(slug)` - Full business details with services, hours, reviews
- `searchBusinesses(input)` - Paginated search with filters
- `getBusinessesForOwner(userId)` - Owner's businesses with stats

### Booking Service (booking.service.ts)

- `createAppointment(customerId, input)` - Book with conflict detection + business hours validation
- `cancelAppointment(appointmentId, userId)` - Cancel with permission check
- `getCustomerAppointments(customerId)` - List customer's appointments
- `getBusinessAppointments(businessId, date)` - List business's daily appointments
- `getAvailableSlots(businessId, serviceId, date)` - Calculate available 15-min slots

### Queue Service (queue.service.ts)

- `joinQueue(customerId, input)` - Atomic token allocation + estimated wait time
- `getQueueStatus(businessId)` - Currently serving, waiting count, completed count
- `callNextInQueue(businessId, staffUserId)` - Call next WAITING ticket
- `startServing(ticketId, staffUserId)` - Move CALLED to SERVING
- `completeTicket(ticketId, staffUserId)` - Move to COMPLETED
- `getCustomerTickets(customerId)` - Active queue tickets

### Payment Service (payment.service.ts)

- `createBookingPayment(params)` - Calculate commission, create payment record
- `processPaymentWebhook(params)` - Idempotent webhook processing
- `processRefund(paymentId, reason)` - Create negative ledger entry
- `getCommissionSummary()` - Aggregate ledger entries

### Notification Service (notification.service.ts)

- `createNotification(params)` - Create notification
- `getUserNotifications(userId, limit?, offset?)` - Paginated with unread count
- `markNotificationRead(notificationId, userId)` - Mark single read
- `markAllNotificationsRead(userId)` - Mark all read

### Review Service (review.service.ts)

- `createReview(customerId, input)` - Verify booking ownership, check duplicates
- `getBusinessReviews(businessId, limit?, offset?)` - With average rating stats
- `moderateReview(reviewId, moderated)` - Toggle moderation flag

### Audit Service (audit.service.ts)

- `createAuditLog(params)` - Record privileged action
- `getAuditLogs(params)` - Query audit logs with filters

---

## Commission & Payments

### Commission Model

| Item                    | Example             |
| ----------------------- | ------------------- |
| Service price           | Rs.1,000.00 (100000 paise) |
| Commission rate         | 10% (configurable)  |
| Platform commission     | Rs.100.00 (10000 paise)    |
| Owner's share           | Rs.900.00 (90000 paise)    |
| Gateway fees & taxes    | Deducted separately       |

### Key Principles

1. **Integer arithmetic** - All money in paise to avoid floating-point errors
2. **Immutable snapshots** - Commission rate captured at booking time (never retroactively changed)
3. **Append-only ledger** - Refunds create negative entries, never modify existing records
4. **Min/max bounds** - Commission policies can set minimum and maximum amounts
5. **Idempotent webhooks** - Payment events deduplicated by `eventId`

### Payment Flow

```
1. Customer books appointment/queue -> createBookingPayment() called
2. Payment record created with status PENDING + commission calculated
3. Customer pays via Razorpay/Stripe (external)
4. Webhook received -> processPaymentWebhook()
5. Idempotency check (eventId) -> Update to CAPTURED + create ledger entry
6. If refund needed -> processRefund() creates REFUND_ADJUSTMENT ledger entry
```

### Commission Calculation (src/lib/commission.ts)

```typescript
calculateCommission(grossAmountPaise, policy, currency)
// Returns: { grossAmountPaise, commissionRatePercent, commissionAmountPaise, ownerSharePaise, currency }

formatCurrency(paise, currency)
// Returns: formatted string like "Rs.1,000.00"
```

---

## Queue System

### Token Allocation

The queue system uses **atomic database operations** to prevent duplicate token numbers:

```
1. Customer calls joinQueue(businessId, serviceId)
2. Transaction:
   a. UPSERT QueueCounter -> increment lastTokenNumber
   b. Count WAITING/CALLED/SERVING tickets -> estimate wait
   c. CREATE QueueTicket with allocated token number
3. Return ticket with token, position, estimated wait
```

### Queue State Machine

```
WAITING -> CALLED -> SERVING -> COMPLETED
                       ^
  (any state can also go to CANCELLED or NO_SHOW)
```

| State     | Triggered By          | Description                          |
| --------- | --------------------- | ------------------------------------ |
| WAITING   | `joinQueue()`         | Customer joined queue                |
| CALLED    | `callNextInQueue()`   | Staff called customer's number       |
| SERVING   | `startServing()`      | Customer at counter, service started |
| COMPLETED | `completeTicket()`    | Service finished                     |
| CANCELLED | Customer cancellation | Customer left queue                  |
| NO_SHOW   | Staff action          | Customer didn't respond when called  |

---

## Role-Based Access Control

### Permission Matrix

| Action                        | Customer | Shop Owner | Admin |
| ----------------------------- | -------- | ---------- | ----- |
| Browse businesses             | Yes      | Yes        | Yes   |
| Book appointments             | Yes      | No         | No    |
| Join walk-in queue            | Yes      | No         | No    |
| Submit reviews                | Yes      | No         | No    |
| View own bookings and queue   | Yes      | No         | No    |
| Create business listing       | No       | Yes        | Yes   |
| Manage own business           | No       | Yes        | No    |
| Manage queue (call/serve)     | No       | Yes        | No    |
| View own earnings             | No       | Yes        | No    |
| Verify businesses             | No       | No         | Yes   |
| Moderate reviews              | No       | No         | Yes   |
| Configure commission          | No       | No         | Yes   |
| View audit logs               | No       | No         | Yes   |
| Process refunds               | No       | No         | Yes   |

### Route Protection

| Route Pattern    | Required Role         | Enforced By                     |
| ---------------- | --------------------- | ------------------------------- |
| `/customer/*`    | Any authenticated     | Middleware + layout             |
| `/owner/*`       | SHOP_OWNER or ADMIN   | Middleware + layout             |
| `/admin/*`       | ADMIN only            | Middleware + layout             |
| `/login`         | Unauthenticated only  | Page-level redirect             |
| `/register`      | Unauthenticated only  | Page-level redirect             |

---

## Security

### Headers (configured in next.config.ts)

| Header                    | Value                              |
| ------------------------- | ---------------------------------- |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| X-Frame-Options           | SAMEORIGIN                         |
| X-Content-Type-Options    | nosniff                            |
| X-XSS-Protection          | 1; mode=block                      |
| Referrer-Policy            | strict-origin-when-cross-origin    |
| Content-Security-Policy   | default-src 'self'; script-src 'self' ... |
| Permissions-Policy         | camera=(), microphone=(), geolocation=(self) |
| X-DNS-Prefetch-Control    | on                                 |

### Rate Limiting

| Endpoint          | Limit                  | Implementation          |
| ----------------- | ---------------------- | ----------------------- |
| `/login` POST     | 10 req / 15 min per IP | Middleware (edge)       |
| `/register` POST  | 10 req / 15 min per IP | Middleware (edge)       |
| Auth operations   | 10 req / 15 min        | Server-side rate limiter |
| Booking operations| 20 req / min           | Server-side rate limiter |
| API general       | 100 req / min          | Server-side rate limiter |
| Webhooks          | 50 req / min           | Server-side rate limiter |

### Additional Security Measures

- HttpOnly session cookies (not accessible via JavaScript)
- Zod validation on all inputs (server-side)
- SQL injection prevention via Prisma parameterized queries
- No raw card details stored (handled by payment gateway)
- Audit logging for all privileged actions
- `poweredByHeader: false` (hides Next.js framework fingerprint)
- Error responses don't leak stack traces or secrets
- Webhook idempotency prevents duplicate payment processing

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test              # Run all unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

Test files are located in:
- `src/lib/__tests__/` - Commission, validations, rate limiter
- `src/server/services/__tests__/` - Booking, queue, payment, review services

### E2E Tests (Playwright)

```bash
npm run test:e2e:install  # Install browsers (first time)
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run with Playwright UI
```

Test files: `e2e/` directory. Covers:
- Homepage rendering and navigation
- Auth flows (login, register)
- Explore/search page
- Cross-browser testing (Chromium, Firefox, WebKit, Mobile)

---

## Deployment

### Docker

```bash
# Build the image
docker build -t queueless .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="your-secret" \
  queueless
```

The Dockerfile uses:
- Multi-stage build (dependencies -> build -> production)
- Non-root user (`nextjs`)
- Health check (`curl http://localhost:3000/api/health`)
- Standalone output for minimal image size

### Environment Setup for Production

1. Set `NODE_ENV=production`
2. Configure a production PostgreSQL database
3. Generate a strong `BETTER_AUTH_SECRET`
4. Set up Razorpay/Stripe with live keys
5. Configure Resend for transactional emails
6. Set `NEXT_PUBLIC_APP_URL` to your production domain

---

## Environment Variables

| Variable                         | Required | Default        | Description                              |
| -------------------------------- | -------- | -------------- | ---------------------------------------- |
| `NEXT_PUBLIC_APP_URL`            | Yes      | localhost:3000  | Application URL                          |
| `NODE_ENV`                       | Yes      | development    | Environment mode                         |
| `DATABASE_URL`                   | Yes      | -              | PostgreSQL connection string             |
| `BETTER_AUTH_SECRET`             | Yes      | -              | Auth session encryption secret           |
| `BETTER_AUTH_URL`                | Yes      | -              | Auth callback URL                        |
| `RESEND_API_KEY`                 | No       | -              | Resend email service API key             |
| `EMAIL_FROM`                     | No       | -              | From email address                       |
| `PAYMENT_PROVIDER`               | No       | razorpay       | Payment gateway (razorpay or stripe)     |
| `RAZORPAY_KEY_ID`                | No       | -              | Razorpay API key ID                      |
| `RAZORPAY_KEY_SECRET`            | No       | -              | Razorpay API key secret                  |
| `RAZORPAY_WEBHOOK_SECRET`        | No       | -              | Razorpay webhook signature secret        |
| `DEFAULT_COMMISSION_RATE_PERCENT`| No       | 10             | Default commission percentage            |
| `DEFAULT_CURRENCY`               | No       | INR            | Default currency code                    |
| `MAX_FILE_SIZE_MB`               | No       | 5              | Max file upload size                     |
| `ALLOWED_IMAGE_TYPES`            | No       | image/jpeg,... | Allowed image MIME types                 |

---

## Troubleshooting

### Build Error: Route segment config is not compatible with cacheComponents

**Cause**: Next.js 16 with `cacheComponents: true` does not allow `export const dynamic` or `export const runtime` in route files.

**Solution**: Already fixed. Cache-Control headers are used instead of route segment configs.

### Build Warning: middleware file convention is deprecated

**Cause**: Next.js 16 has deprecated the `middleware.ts` convention in favor of `proxy.ts`.

**Solution**: Run `npx @next/codemod@canary middleware-to-proxy .` to auto-migrate, or keep using middleware (it still works with a deprecation warning).

### Invalid email or password when logging in with demo accounts

**Cause**: The database has not been seeded, or the seed used placeholder password hashes.

**Solution**: Run `npm run db:seed` with the updated seed file that contains proper SHA-256 hashes matching the auth service.

### Database connection error

**Cause**: `DATABASE_URL` not set or PostgreSQL not running.

**Solution**: Check `.env.local` has a valid `DATABASE_URL`. Ensure PostgreSQL is running and accessible.

### Prisma schema out of sync

```bash
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema changes to DB
```

### TypeScript Type Errors with unknown as ReactNode

**Cause**: React 19 strict mode rejects `unknown` typed values as JSX children.

**Solution**: Use `String()` wrapper to explicitly convert unknown values, or use `=== true` for boolean checks in JSX conditionals.

---

## Validation Schemas Reference

All Zod schemas are defined in `src/lib/validations.ts`.

| Schema                     | Fields                                           |
| -------------------------- | ------------------------------------------------ |
| `registerSchema`           | email, password (8+), name, phone?, role          |
| `loginSchema`              | email, password                                   |
| `createBusinessSchema`     | name, address, city, state, pincode, categoryId, ... |
| `updateBusinessSchema`     | All createBusiness fields (partial)                |
| `createServiceSchema`      | name, durationMinutes, priceAmount, currency       |
| `businessHoursSchema`      | dayOfWeek, openTime, closeTime, breaks, isClosed   |
| `createAppointmentSchema`  | businessId, serviceId, date, startTime, notes?     |
| `joinQueueSchema`          | businessId, serviceId                              |
| `createReviewSchema`       | businessId, bookingId, bookingType, rating, comment?|
| `createCommissionPolicySchema` | name, ratePercent, minAmount?, maxAmount?       |
| `searchBusinessesSchema`   | q?, category?, city?, page, limit, sortBy          |
| `paginationSchema`         | page, limit                                        |

---

*Last updated: October 2026 | QueueLess v0.1.0*
