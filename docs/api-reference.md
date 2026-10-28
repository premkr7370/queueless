# QueueLess — API Reference

## Status: ✅ All Phases Complete

---

## API Endpoints

### Health Check

```
GET /api/health
```

Returns system status for load balancers and monitoring.

**Response** (200):
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

### Payment Webhook

```
POST /api/webhooks/payment
```

Receives payment events from Razorpay/Stripe. Idempotent — duplicate events are safely ignored.

**Handled event types:**
- `payment.captured` (Razorpay)
- `payment_intent.succeeded` (Stripe)

---

## Server Actions

All data mutations are performed via Next.js Server Actions. These are type-safe, CSRF-protected RPC calls.

### Auth Actions (`server/actions/auth.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `loginAction(formData)` | Authenticate user, create session | No |
| `registerAction(formData)` | Create user account | No |
| `logoutAction()` | Destroy session | Yes |

### Booking Actions (`server/actions/booking.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `createAppointmentAction(formData)` | Book an appointment | CUSTOMER |
| `cancelAppointmentAction(appointmentId)` | Cancel appointment | CUSTOMER / OWNER |
| `joinQueueAction(formData)` | Join walk-in queue | CUSTOMER |
| `callNextAction(businessId)` | Call next in queue | OWNER / STAFF |
| `startServingAction(ticketId)` | Mark ticket as serving | OWNER / STAFF |
| `completeTicketAction(ticketId)` | Mark ticket as completed | OWNER / STAFF |

### Business Actions (`server/actions/business.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `registerBusinessAction(formData)` | Register new business | SHOP_OWNER |
| `updateBusinessAction(id, formData)` | Update business details | OWNER |

### Payment Actions (`server/actions/payment.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `createPaymentAction(params)` | Create payment record | CUSTOMER |

### Review Actions (`server/actions/review.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `submitReviewAction(formData)` | Submit a review | CUSTOMER |

### Notification Actions (`server/actions/notification.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `markNotificationReadAction(id)` | Mark notification as read | Authenticated |

### Admin Actions (`server/actions/admin.actions.ts`)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `getBusinessesForVerificationAction()` | List businesses for review | ADMIN |
| `verifyBusinessAction(id, status, note)` | Approve/reject business | ADMIN |
| `getCommissionPoliciesAction()` | List commission policies | ADMIN |
| `createCommissionPolicyAction(formData)` | Create new commission policy | ADMIN |
| `getAdminStatsAction()` | Get platform-wide statistics | ADMIN |
| `getAuditLogsAction(limit)` | Get audit trail | ADMIN |
| `moderateReviewAction(reviewId, moderated)` | Moderate a review | ADMIN |

---

## Service Layer

Business logic is encapsulated in the service layer (`server/services/`):

| Service | Responsibilities |
|---------|-----------------|
| `auth.service.ts` | Password hashing, session management, user lookup |
| `booking.service.ts` | Appointment CRUD, conflict detection, slot calculation |
| `queue.service.ts` | Token allocation, queue status, call/serve/complete flows |
| `business.service.ts` | Business CRUD, owner lookup, search |
| `payment.service.ts` | Payment creation, webhook processing, refunds, commission |
| `review.service.ts` | Review creation, business reviews, moderation |
| `notification.service.ts` | Notification creation, fetch, mark-as-read |
| `audit.service.ts` | Audit log creation |

---

## Validation Schemas

All inputs are validated with Zod schemas (`lib/validations.ts`):

| Schema | Used For |
|--------|----------|
| `registerSchema` | User registration |
| `loginSchema` | User login |
| `createBusinessSchema` | Business registration |
| `createServiceSchema` | Service creation |
| `businessHoursSchema` | Business operating hours |
| `createAppointmentSchema` | Appointment booking |
| `joinQueueSchema` | Queue join |
| `createReviewSchema` | Review submission |
| `createCommissionPolicySchema` | Commission policy |
| `searchBusinessesSchema` | Business search & filtering |
| `paginationSchema` | Pagination params |
