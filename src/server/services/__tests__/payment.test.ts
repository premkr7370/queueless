/**
 * Payment service unit tests.
 *
 * Tests payment creation with commission calculation,
 * webhook processing (idempotency), refund logic, and commission summary.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPrismaMock, resetAllMocks } from "./prisma.mock";

import "./prisma.mock";

// Mock the commission module
vi.mock("@/lib/commission", () => ({
  calculateCommission: vi.fn().mockReturnValue({
    grossAmountPaise: 100000,
    commissionRatePercent: 10,
    commissionAmountPaise: 10000,
    ownerSharePaise: 90000,
    currency: "INR",
  }),
}));

import {
  createBookingPayment,
  processPaymentWebhook,
  processRefund,
  getCommissionSummary,
} from "@/server/services/payment.service";

let prisma: Awaited<ReturnType<typeof getPrismaMock>>;

beforeEach(async () => {
  resetAllMocks();
  prisma = await getPrismaMock();
});

describe("createBookingPayment", () => {
  it("creates a payment with commission snapshot", async () => {
    prisma.commissionPolicy.findFirst.mockResolvedValue({
      id: "policy_1",
      ratePercent: 10,
      minAmountPaise: null,
      maxAmountPaise: null,
      isActive: true,
    });

    const mockPayment = {
      id: "pay_1",
      grossAmountPaise: 100000,
      commissionAmountPaise: 10000,
      ownerSharePaise: 90000,
      paymentStatus: "PENDING",
    };
    prisma.bookingPayment.create.mockResolvedValue(mockPayment);

    const result = await createBookingPayment({
      appointmentId: "appt_1",
      grossAmountPaise: 100000,
    });

    expect(result.paymentStatus).toBe("PENDING");
    expect(prisma.bookingPayment.create).toHaveBeenCalled();
  });

  it("throws when neither appointmentId nor queueTicketId is provided", async () => {
    await expect(
      createBookingPayment({ grossAmountPaise: 100000 })
    ).rejects.toThrow("Either appointmentId or queueTicketId is required");
  });

  it("throws when no active commission policy exists", async () => {
    prisma.commissionPolicy.findFirst.mockResolvedValue(null);

    await expect(
      createBookingPayment({
        appointmentId: "appt_1",
        grossAmountPaise: 100000,
      })
    ).rejects.toThrow("No active commission policy found");
  });

  it("accepts queue ticket payment", async () => {
    prisma.commissionPolicy.findFirst.mockResolvedValue({
      id: "policy_1",
      ratePercent: 10,
      isActive: true,
    });
    prisma.bookingPayment.create.mockResolvedValue({
      id: "pay_2",
      queueTicketId: "ticket_1",
      paymentStatus: "PENDING",
    });

    const result = await createBookingPayment({
      queueTicketId: "ticket_1",
      grossAmountPaise: 50000,
    });

    expect(result.id).toBe("pay_2");
  });
});

describe("processPaymentWebhook", () => {
  const webhookParams = {
    provider: "razorpay",
    eventId: "evt_123",
    eventType: "payment.captured",
    payload: { amount: 100000 },
    providerOrderId: "order_123",
    providerPaymentId: "pay_123",
  };

  it("processes a new payment webhook and captures payment", async () => {
    prisma.webhookEvent.findUnique.mockResolvedValue(null); // not processed
    prisma.webhookEvent.create.mockResolvedValue({});
    prisma.bookingPayment.findFirst.mockResolvedValue({
      id: "bp_1",
      commissionAmountPaise: 10000,
    });
    prisma.bookingPayment.update.mockResolvedValue({});
    prisma.commissionLedgerEntry.create.mockResolvedValue({});
    prisma.webhookEvent.update.mockResolvedValue({});

    const result = await processPaymentWebhook(webhookParams);
    expect(result.status).toBe("captured");
  });

  it("returns already_processed for duplicate events (idempotent)", async () => {
    prisma.webhookEvent.findUnique.mockResolvedValue({
      id: "we_1",
      eventId: "evt_123",
    });

    const result = await processPaymentWebhook(webhookParams);
    expect(result.status).toBe("already_processed");
    // Should NOT create payment or ledger entries
    expect(prisma.webhookEvent.create).not.toHaveBeenCalled();
  });

  it("returns payment_not_found when order ID doesn't match", async () => {
    prisma.webhookEvent.findUnique.mockResolvedValue(null);
    prisma.webhookEvent.create.mockResolvedValue({});
    prisma.bookingPayment.findFirst.mockResolvedValue(null);

    const result = await processPaymentWebhook(webhookParams);
    expect(result.status).toBe("payment_not_found");
  });

  it("returns unhandled_event_type for non-capture events", async () => {
    prisma.webhookEvent.findUnique.mockResolvedValue(null);
    prisma.webhookEvent.create.mockResolvedValue({});

    const result = await processPaymentWebhook({
      ...webhookParams,
      eventType: "payment.failed",
    });
    expect(result.status).toBe("unhandled_event_type");
  });

  it("handles Stripe payment_intent.succeeded event", async () => {
    prisma.webhookEvent.findUnique.mockResolvedValue(null);
    prisma.webhookEvent.create.mockResolvedValue({});
    prisma.bookingPayment.findFirst.mockResolvedValue({
      id: "bp_1",
      commissionAmountPaise: 5000,
    });
    prisma.bookingPayment.update.mockResolvedValue({});
    prisma.commissionLedgerEntry.create.mockResolvedValue({});
    prisma.webhookEvent.update.mockResolvedValue({});

    const result = await processPaymentWebhook({
      ...webhookParams,
      provider: "stripe",
      eventType: "payment_intent.succeeded",
    });
    expect(result.status).toBe("captured");
  });
});

describe("processRefund", () => {
  it("refunds a captured payment with negative ledger entry", async () => {
    prisma.bookingPayment.findUnique.mockResolvedValue({
      id: "bp_1",
      paymentStatus: "CAPTURED",
      commissionAmountPaise: 10000,
    });
    prisma.bookingPayment.update.mockResolvedValue({});
    prisma.commissionLedgerEntry.create.mockResolvedValue({});

    const result = await processRefund("bp_1", "Customer requested");
    expect(result.status).toBe("refunded");
  });

  it("throws when payment is not found", async () => {
    prisma.bookingPayment.findUnique.mockResolvedValue(null);

    await expect(processRefund("bp_999", "reason")).rejects.toThrow(
      "Payment not found or not in CAPTURED state"
    );
  });

  it("throws when payment is not in CAPTURED state", async () => {
    prisma.bookingPayment.findUnique.mockResolvedValue({
      id: "bp_1",
      paymentStatus: "PENDING",
    });

    await expect(processRefund("bp_1", "reason")).rejects.toThrow(
      "Payment not found or not in CAPTURED state"
    );
  });
});

describe("getCommissionSummary", () => {
  it("calculates net commission from ledger entries", async () => {
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([
      { type: "COMMISSION", amountPaise: 10000 },
      { type: "COMMISSION", amountPaise: 5000 },
      { type: "REFUND_ADJUSTMENT", amountPaise: -3000 },
    ]);

    const result = await getCommissionSummary();
    expect(result.totalCommissionPaise).toBe(15000);
    expect(result.totalRefundAdjustmentsPaise).toBe(-3000);
    expect(result.netCommissionPaise).toBe(12000);
  });

  it("handles empty ledger", async () => {
    prisma.commissionLedgerEntry.findMany.mockResolvedValue([]);

    const result = await getCommissionSummary();
    expect(result.totalCommissionPaise).toBe(0);
    expect(result.totalRefundAdjustmentsPaise).toBe(0);
    expect(result.netCommissionPaise).toBe(0);
  });
});
