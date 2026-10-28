/**
 * Payment service — server-only business logic for payments and commission.
 *
 * Handles payment creation, webhook processing, commission ledger entries,
 * and refund flows. All monetary values in paise (integer minor currency units).
 */

import { prisma } from "@/lib/db";
import { calculateCommission } from "@/lib/commission";
import type { Prisma } from "@prisma/client";

/**
 * Create a booking payment record and calculate commission.
 * Called when a booking is confirmed and ready for payment.
 */
export async function createBookingPayment(params: {
  appointmentId?: string;
  queueTicketId?: string;
  grossAmountPaise: number;
  currency?: string;
}) {
  const { appointmentId, queueTicketId, grossAmountPaise, currency = "INR" } = params;

  if (!appointmentId && !queueTicketId) {
    throw new Error("Either appointmentId or queueTicketId is required");
  }

  // Get active commission policy
  const policy = await prisma.commissionPolicy.findFirst({
    where: { isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });

  if (!policy) {
    throw new Error("No active commission policy found");
  }

  // Calculate commission using integer arithmetic
  const calc = calculateCommission(grossAmountPaise, {
    ratePercent: Number(policy.ratePercent),
    minAmountPaise: policy.minAmountPaise,
    maxAmountPaise: policy.maxAmountPaise,
  }, currency);

  // Create payment and ledger entry in a transaction
  const payment = await prisma.$transaction(async (tx) => {
    const bp = await tx.bookingPayment.create({
      data: {
        appointmentId: appointmentId || null,
        queueTicketId: queueTicketId || null,
        grossAmountPaise: calc.grossAmountPaise,
        currency,
        commissionRateSnapshot: calc.commissionRatePercent,
        commissionAmountPaise: calc.commissionAmountPaise,
        ownerSharePaise: calc.ownerSharePaise,
        paymentStatus: "PENDING",
      },
    });

    return bp;
  });

  return payment;
}

/**
 * Process a payment webhook event.
 * Idempotent — uses eventId as a dedup key.
 */
export async function processPaymentWebhook(params: {
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  providerOrderId: string;
  providerPaymentId: string;
}) {
  const { provider, eventId, eventType, payload, providerOrderId, providerPaymentId } = params;

  // Idempotency check
  const existing = await prisma.webhookEvent.findUnique({
    where: { eventId },
  });

  if (existing) {
    return { status: "already_processed" };
  }

  // Record the webhook event first (crash recovery)
  await prisma.webhookEvent.create({
    data: {
      provider,
      eventId,
      eventType,
      payload: payload as Prisma.InputJsonValue,
    },
  });

  if (eventType === "payment.captured" || eventType === "payment_intent.succeeded") {
    // Find the payment by provider order ID
    const payment = await prisma.bookingPayment.findFirst({
      where: { providerOrderId },
    });

    if (!payment) {
      return { status: "payment_not_found" };
    }

    // Update payment status and create ledger entry
    await prisma.$transaction(async (tx) => {
      await tx.bookingPayment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: "CAPTURED",
          providerPaymentId,
          paidAt: new Date(),
        },
      });

      await tx.commissionLedgerEntry.create({
        data: {
          bookingPaymentId: payment.id,
          type: "COMMISSION",
          amountPaise: payment.commissionAmountPaise,
          description: `Commission on booking payment ${payment.id}`,
        },
      });

      // Mark webhook as processed
      await tx.webhookEvent.update({
        where: { eventId },
        data: { processedAt: new Date() },
      });
    });

    return { status: "captured" };
  }

  return { status: "unhandled_event_type" };
}

/**
 * Process a refund. Creates a new ledger entry (never modifies existing records).
 */
export async function processRefund(paymentId: string, reason: string) {
  const payment = await prisma.bookingPayment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.paymentStatus !== "CAPTURED") {
    throw new Error("Payment not found or not in CAPTURED state");
  }

  await prisma.$transaction(async (tx) => {
    await tx.bookingPayment.update({
      where: { id: paymentId },
      data: { paymentStatus: "REFUNDED" },
    });

    // Reverse commission with a negative ledger entry
    await tx.commissionLedgerEntry.create({
      data: {
        bookingPaymentId: paymentId,
        type: "REFUND_ADJUSTMENT",
        amountPaise: -payment.commissionAmountPaise,
        description: `Refund adjustment: ${reason}`,
      },
    });
  });

  return { status: "refunded" };
}

/**
 * Get commission summary for admin dashboard.
 */
export async function getCommissionSummary() {
  const ledgerEntries = await prisma.commissionLedgerEntry.findMany({
    select: { type: true, amountPaise: true },
  });

  const totalCommission = ledgerEntries
    .filter((e) => e.type === "COMMISSION")
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const totalRefundAdjustments = ledgerEntries
    .filter((e) => e.type === "REFUND_ADJUSTMENT")
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const netCommission = totalCommission + totalRefundAdjustments; // adjustments are negative

  return {
    totalCommissionPaise: totalCommission,
    totalRefundAdjustmentsPaise: totalRefundAdjustments,
    netCommissionPaise: netCommission,
  };
}
