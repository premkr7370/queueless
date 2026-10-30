/**
 * Booking (Appointment) service — server-only business logic.
 */

import { prisma } from "@/lib/db";
import type { CreateAppointmentInput } from "@/lib/validations";

/**
 * Create an appointment booking.
 */
export async function createAppointment(customerId: string, input: CreateAppointmentInput) {
  const { businessId, serviceId, date, startTime, notes } = input;

  // Verify business
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, isActive: true, timezone: true },
  });

  if (!business || !business.isActive) {
    throw new Error("Business not found or is inactive");
  }

  // Verify service
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  });

  if (!service) {
    throw new Error("Service not found or is inactive");
  }

  // Reject past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    throw new Error("Cannot book appointments in the past");
  }

  // Calculate end time
  const [hours, minutes] = startTime.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + service.durationMinutes;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  // Check business hours (read-only, safe outside transaction)
  const dayOfWeek = date.getDay();
  const businessHours = await prisma.businessHours.findUnique({
    where: { businessId_dayOfWeek: { businessId, dayOfWeek } },
  });

  if (!businessHours || businessHours.isClosed) {
    throw new Error("The business is closed on this day");
  }

  if (startTime < businessHours.openTime || endTime > businessHours.closeTime) {
    throw new Error("The requested time is outside business hours");
  }

  // Check break time conflicts
  if (businessHours.breakStartTime && businessHours.breakEndTime) {
    if (startTime < businessHours.breakEndTime && endTime > businessHours.breakStartTime) {
      throw new Error("The requested time overlaps with the business break");
    }
  }

  // Use a serializable transaction for conflict check + insert to prevent TOCTOU race
  const appointment = await prisma.$transaction(async (tx) => {
    // Check for scheduling conflicts inside the transaction
    const conflicting = await tx.appointment.findFirst({
      where: {
        businessId,
        date,
        status: { in: ["CONFIRMED"] },
        OR: [
          { startTime: { gte: startTime, lt: endTime } },
          { endTime: { gt: startTime, lte: endTime } },
        ],
      },
    });

    if (conflicting) {
      throw new Error("This time slot is already booked");
    }

    return tx.appointment.create({
      data: {
        businessId,
        serviceId,
        customerId,
        date,
        startTime,
        endTime,
        notes: notes || null,
        status: "CONFIRMED",
      },
      include: {
        business: { select: { name: true, slug: true, address: true, city: true } },
        service: { select: { name: true, durationMinutes: true, priceAmount: true, currency: true } },
      },
    });
  });

  return appointment;
}

/**
 * Cancel an appointment.
 */
export async function cancelAppointment(appointmentId: string, userId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, customerId: true, businessId: true, status: true },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Allow customer or business staff to cancel
  const isCustomer = appointment.customerId === userId;
  const isStaff = await prisma.businessMembership.findFirst({
    where: { businessId: appointment.businessId, userId },
  });

  if (!isCustomer && !isStaff) {
    throw new Error("You do not have permission to cancel this appointment");
  }

  if (appointment.status !== "CONFIRMED") {
    throw new Error("Only confirmed appointments can be cancelled");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });
}

/**
 * Get appointments for a customer.
 */
export async function getCustomerAppointments(customerId: string) {
  return prisma.appointment.findMany({
    where: { customerId },
    include: {
      business: { select: { name: true, slug: true, address: true, city: true } },
      service: { select: { name: true, durationMinutes: true, priceAmount: true, currency: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });
}

/**
 * Get appointments for a business on a given date.
 */
export async function getBusinessAppointments(businessId: string, date: Date) {
  return prisma.appointment.findMany({
    where: { businessId, date },
    include: {
      customer: { select: { name: true, phone: true } },
      service: { select: { name: true, durationMinutes: true } },
      staff: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

/**
 * Get available time slots for a service on a given date.
 */
export async function getAvailableSlots(
  businessId: string,
  serviceId: string,
  date: Date
) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  const dayOfWeek = date.getDay();
  const hours = await prisma.businessHours.findUnique({
    where: { businessId_dayOfWeek: { businessId, dayOfWeek } },
  });

  if (!hours || hours.isClosed) {
    return []; // Closed
  }

  // Get existing appointments for the day
  const existingAppointments = await prisma.appointment.findMany({
    where: { businessId, date, status: "CONFIRMED" },
    select: { startTime: true, endTime: true },
  });

  // Generate all possible slots
  const slots: { startTime: string; endTime: string; available: boolean }[] = [];
  const [openH, openM] = hours.openTime.split(":").map(Number);
  const [closeH, closeM] = hours.closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  for (let start = openMinutes; start + service.durationMinutes <= closeMinutes; start += 15) {
    const startTime = `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`;
    const endMin = start + service.durationMinutes;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

    // Check break overlap
    if (hours.breakStartTime && hours.breakEndTime) {
      if (startTime < hours.breakEndTime && endTime > hours.breakStartTime) {
        continue;
      }
    }

    // Check conflict with existing appointments
    const conflict = existingAppointments.some(
      (appt) => startTime < appt.endTime && endTime > appt.startTime
    );

    slots.push({ startTime, endTime, available: !conflict });
  }

  return slots;
}
