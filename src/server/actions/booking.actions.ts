"use server";

import { cookies } from "next/headers";
import { joinQueueSchema, createAppointmentSchema } from "@/lib/validations";
import { getSessionUser } from "@/server/services/auth.service";
import { joinQueue, callNextInQueue, startServing, completeTicket } from "@/server/services/queue.service";
import { createAppointment, cancelAppointment } from "@/server/services/booking.service";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) throw new Error("Not authenticated");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Invalid session");
  return user;
}

// ──────────────────────────────────────────────
// Queue actions
// ──────────────────────────────────────────────

export async function joinQueueAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const parsed = joinQueueSchema.safeParse({
      businessId: formData.get("businessId"),
      serviceId: formData.get("serviceId"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const ticket = await joinQueue(user.id, parsed.data);
    return { success: true, data: ticket };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to join queue" };
  }
}

export async function callNextAction(businessId: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const ticket = await callNextInQueue(businessId, user.id);
    return { success: true, data: ticket };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function startServingAction(ticketId: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const ticket = await startServing(ticketId, user.id);
    return { success: true, data: ticket };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function completeTicketAction(ticketId: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const ticket = await completeTicket(ticketId, user.id);
    return { success: true, data: ticket };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

// ──────────────────────────────────────────────
// Booking actions
// ──────────────────────────────────────────────

export async function createAppointmentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const parsed = createAppointmentSchema.safeParse({
      businessId: formData.get("businessId"),
      serviceId: formData.get("serviceId"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const appointment = await createAppointment(user.id, parsed.data);
    return { success: true, data: appointment };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to book" };
  }
}

export async function cancelAppointmentAction(appointmentId: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    await cancelAppointment(appointmentId, user.id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to cancel" };
  }
}
