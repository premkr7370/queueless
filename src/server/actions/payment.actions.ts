"use server";

import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/auth.service";
import {
  createBookingPayment,
  processRefund,
  getCommissionSummary,
} from "@/server/services/payment.service";
import { createNotification } from "@/server/services/notification.service";
import { prisma } from "@/lib/db";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) throw new Error("Not authenticated");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Invalid session");
  return user;
}

/**
 * Create a payment for an appointment booking.
 */
export async function createAppointmentPaymentAction(appointmentId: string) {
  try {
    const user = await requireAuth();

    // Verify the appointment belongs to this user
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, customerId: user.id },
      include: { service: true, business: { select: { name: true } } },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    const payment = await createBookingPayment({
      appointmentId,
      grossAmountPaise: appointment.service.priceAmount,
      currency: appointment.service.currency,
    });

    // Notify customer
    await createNotification({
      userId: user.id,
      type: "BOOKING_CONFIRMATION",
      title: "Payment Created",
      body: `Payment initiated for your appointment at ${appointment.business.name}`,
      metadata: { appointmentId, paymentId: payment.id },
    });

    return { success: true, data: { paymentId: payment.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Payment failed" };
  }
}

/**
 * Create a payment for a queue ticket.
 */
export async function createQueuePaymentAction(queueTicketId: string) {
  try {
    const user = await requireAuth();

    const ticket = await prisma.queueTicket.findFirst({
      where: { id: queueTicketId, customerId: user.id },
      include: { service: true, business: { select: { name: true } } },
    });

    if (!ticket) {
      return { success: false, error: "Queue ticket not found" };
    }

    const payment = await createBookingPayment({
      queueTicketId,
      grossAmountPaise: ticket.service.priceAmount,
      currency: ticket.service.currency,
    });

    return { success: true, data: { paymentId: payment.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Payment failed" };
  }
}

/**
 * Admin: Process a refund.
 */
export async function processRefundAction(paymentId: string, reason: string) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    const result = await processRefund(paymentId, reason);
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Refund failed" };
  }
}

/**
 * Admin: Get commission summary.
 */
export async function getCommissionSummaryAction() {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN") {
      return null;
    }
    return getCommissionSummary();
  } catch {
    return null;
  }
}
