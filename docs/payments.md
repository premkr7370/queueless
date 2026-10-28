# QueueLess — Payments

## Status: ✅ Implemented (Phase 7)

## Payment Provider

QueueLess is designed to work with **Razorpay** (primary, for Indian market) or **Stripe** (alternative). The integration uses a provider adapter pattern so the core booking logic is payment-provider-agnostic.

## Payment Flow

```
1. Customer selects service and confirms booking
2. Server creates BookingPayment record (status: PENDING)
3. Server creates payment order/intent with provider
4. Client renders provider checkout widget
5. Customer completes payment
6. Provider sends webhook to /api/webhooks/payment
7. Server validates webhook signature
8. Server updates BookingPayment status (CAPTURED)
9. Commission calculated and ledger entry created
10. Booking confirmed
```

## Important Rules

- **Never mark a booking as paid based on client-side redirect alone**
- **Always verify payment status via webhook or server-side API call**
- **Webhook handling must be idempotent** (use provider event ID as dedup key)
- **Store a WebhookEvent record before processing** to ensure crash recovery

## Commission at Payment Time

When a payment is captured:

```
grossAmountPaise = service.priceAmount
commissionRate = activePolicy.ratePercent  (snapshot)
commissionPaise = Math.round(grossAmountPaise * commissionRate / 100)
ownerSharePaise = grossAmountPaise - commissionPaise
```

## Refunds

- Refunds create new CommissionLedgerEntry records
- Original payment and commission records are never modified
- Partial refunds supported with proportional commission adjustment

## Demo Mode

For development, the payment module operates in demo/test mode:
- Test API keys only
- No real money processed
- Payment simulation available for E2E testing

## Marketplace Payouts

If the provider supports marketplace splits (Razorpay Route, Stripe Connect):
- Requires provider approval and merchant KYC
- Documented onboarding requirements
- Manual reconciliation workflow as fallback
