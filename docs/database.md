# QueueLess — Database Design

## Status: ✅ Implemented (Phase 2)

This document describes the PostgreSQL schema for QueueLess, implemented with Prisma 7.

## Core Entities

### User
- `id` UUID PK
- `email` unique, indexed
- `name`, `phone` (optional)
- `role` enum (CUSTOMER, SHOP_OWNER, ADMIN)
- `emailVerified` boolean
- `createdAt`, `updatedAt` timestamps

### Business
- `id` UUID PK
- `slug` unique, indexed
- `name`, `description`, `address`, `city`, `state`, `pincode`
- `phone`, `email`, `website`
- `timezone` (e.g., Asia/Kolkata)
- `categoryId` FK → Category
- `verificationStatus` enum (PENDING, APPROVED, REJECTED)
- `verificationNote`
- `logoUrl`, `coverImageUrl`
- `isActive` boolean
- `createdAt`, `updatedAt`

### BusinessMembership
- `id` UUID PK
- `userId` FK → User (indexed)
- `businessId` FK → Business (indexed)
- `role` enum (OWNER, MANAGER, STAFF)
- Unique constraint: (userId, businessId)

### Category
- `id` UUID PK
- `slug` unique
- `name`, `description`, `icon`
- `sortOrder`

### Service
- `id` UUID PK
- `businessId` FK → Business (indexed)
- `name`, `description`
- `durationMinutes`
- `priceAmount` integer (minor currency units — paise)
- `currency` string (e.g., INR)
- `isActive` boolean

### BusinessHours
- `id` UUID PK
- `businessId` FK → Business
- `dayOfWeek` integer (0=Sunday, 6=Saturday)
- `openTime`, `closeTime` time
- `breakStartTime`, `breakEndTime` time (nullable)
- `isClosed` boolean

### Appointment
- `id` UUID PK
- `businessId` FK → Business
- `serviceId` FK → Service
- `customerId` FK → User
- `staffId` FK → User (nullable)
- `date` date
- `startTime`, `endTime` time
- `status` enum (CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
- `notes` text (nullable)
- `createdAt`, `updatedAt`

### QueueCounter
- `id` UUID PK
- `businessId` FK → Business
- `date` date
- `lastTokenNumber` integer (for atomic increment)
- Unique constraint: (businessId, date)

### QueueTicket
- `id` UUID PK
- `businessId` FK → Business
- `serviceId` FK → Service
- `customerId` FK → User
- `tokenNumber` integer
- `date` date
- `status` enum (WAITING, CALLED, SERVING, COMPLETED, CANCELLED, NO_SHOW)
- `estimatedWaitMinutes` integer (nullable)
- `calledAt`, `servingStartedAt`, `completedAt` timestamps (nullable)
- `createdAt`, `updatedAt`
- Unique constraint: (businessId, date, tokenNumber)

### CommissionPolicy
- `id` UUID PK
- `name`
- `ratePercent` decimal
- `minAmountPaise` integer (nullable)
- `maxAmountPaise` integer (nullable)
- `isActive` boolean
- `effectiveFrom` timestamp
- `createdAt`

### BookingPayment
- `id` UUID PK
- `appointmentId` or `queueTicketId` FK (one must be set)
- `grossAmountPaise` integer
- `currency` string
- `commissionRateSnapshot` decimal
- `commissionAmountPaise` integer
- `ownerSharePaise` integer
- `paymentStatus` enum (PENDING, CAPTURED, REFUNDED, FAILED)
- `providerOrderId`, `providerPaymentId` (nullable)
- `createdAt`, `updatedAt`

### CommissionLedgerEntry
- `id` UUID PK
- `bookingPaymentId` FK → BookingPayment
- `type` enum (COMMISSION, REFUND_ADJUSTMENT)
- `amountPaise` integer (can be negative for refunds)
- `description`
- `createdAt`

### Review
- `id` UUID PK
- `businessId` FK → Business
- `customerId` FK → User
- `bookingId` UUID (polymorphic ref)
- `rating` integer (1-5)
- `comment` text (nullable)
- `isModerated` boolean
- `createdAt`, `updatedAt`

### AuditLog
- `id` UUID PK
- `userId` FK → User
- `action` string
- `entityType`, `entityId` string
- `details` JSON
- `ipAddress` string (nullable)
- `createdAt`

## Indexing Strategy

- All FK columns indexed
- `Business.slug`, `Category.slug` unique indexed
- `QueueTicket(businessId, date, status)` composite index for queue queries
- `Appointment(businessId, date, status)` composite index
- `BookingPayment(paymentStatus)` for reconciliation queries
- `AuditLog(userId, createdAt)` for audit trail

## Money Handling

- All monetary amounts stored as integers in minor currency units (paise for INR)
- Currency stored explicitly with each amount
- No floating-point arithmetic for money
- Consistent rounding: Math.round() applied once at final calculation
