/**
 * Booking service unit tests.
 *
 * Tests appointment creation with conflict detection,
 * business hours validation, cancellation logic, and slot calculation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getPrismaMock, resetAllMocks } from "./prisma.mock";

// Must import mock setup first, then the service
import "./prisma.mock";
import {
  createAppointment,
  cancelAppointment,
  getCustomerAppointments,
  getAvailableSlots,
} from "@/server/services/booking.service";

let prisma: Awaited<ReturnType<typeof getPrismaMock>>;

beforeEach(async () => {
  resetAllMocks();
  prisma = await getPrismaMock();
});

describe("createAppointment", () => {
  const validInput = {
    businessId: "biz_1",
    serviceId: "svc_1",
    date: new Date("2026-12-01"),
    startTime: "10:00",
    notes: "Please be on time",
  };

  it("creates an appointment when all validations pass", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      timezone: "Asia/Kolkata",
    });

    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      businessId: "biz_1",
      isActive: true,
      durationMinutes: 30,
    });

    prisma.appointment.findFirst.mockResolvedValue(null); // no conflicts

    prisma.businessHours.findUnique.mockResolvedValue({
      businessId: "biz_1",
      dayOfWeek: 2, // Tuesday
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: false,
      breakStartTime: null,
      breakEndTime: null,
    });

    const mockAppointment = {
      id: "appt_1",
      businessId: "biz_1",
      serviceId: "svc_1",
      customerId: "user_1",
      startTime: "10:00",
      endTime: "10:30",
      status: "CONFIRMED",
      business: { name: "Test Salon", slug: "test-salon", address: "123 St", city: "Bangalore" },
      service: { name: "Haircut", durationMinutes: 30, priceAmount: 50000, currency: "INR" },
    };
    prisma.appointment.create.mockResolvedValue(mockAppointment);

    const result = await createAppointment("user_1", validInput);
    expect(result.id).toBe("appt_1");
    expect(result.status).toBe("CONFIRMED");
    expect(prisma.appointment.create).toHaveBeenCalledOnce();
  });

  it("throws when business is not found", async () => {
    prisma.business.findUnique.mockResolvedValue(null);

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "Business not found or is inactive"
    );
  });

  it("throws when business is inactive", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: false,
      timezone: "Asia/Kolkata",
    });

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "Business not found or is inactive"
    );
  });

  it("throws when service is not found", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      timezone: "Asia/Kolkata",
    });
    prisma.service.findFirst.mockResolvedValue(null);

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "Service not found or is inactive"
    );
  });

  it("throws when time slot has a conflict", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      timezone: "Asia/Kolkata",
    });
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.appointment.findFirst.mockResolvedValue({
      id: "existing_appt",
    }); // conflict exists

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "This time slot is already booked"
    );
  });

  it("throws when business is closed on the requested day", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      timezone: "Asia/Kolkata",
    });
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.businessHours.findUnique.mockResolvedValue({
      isClosed: true,
    });

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "The business is closed on this day"
    );
  });

  it("throws when time is outside business hours", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      timezone: "Asia/Kolkata",
    });
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.businessHours.findUnique.mockResolvedValue({
      openTime: "11:00",
      closeTime: "18:00",
      isClosed: false,
      breakStartTime: null,
      breakEndTime: null,
    });

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "The requested time is outside business hours"
    );
  });

  it("throws when time overlaps with break", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      timezone: "Asia/Kolkata",
    });
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 60,
    });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.businessHours.findUnique.mockResolvedValue({
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: false,
      breakStartTime: "10:00",
      breakEndTime: "10:30",
    });

    await expect(createAppointment("user_1", validInput)).rejects.toThrow(
      "The requested time overlaps with the business break"
    );
  });
});

describe("cancelAppointment", () => {
  it("cancels a confirmed appointment by the customer", async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: "appt_1",
      customerId: "user_1",
      businessId: "biz_1",
      status: "CONFIRMED",
    });
    prisma.businessMembership.findFirst.mockResolvedValue(null);
    prisma.appointment.update.mockResolvedValue({
      id: "appt_1",
      status: "CANCELLED",
    });

    const result = await cancelAppointment("appt_1", "user_1");
    expect(result.status).toBe("CANCELLED");
  });

  it("throws when appointment is not found", async () => {
    prisma.appointment.findUnique.mockResolvedValue(null);

    await expect(cancelAppointment("appt_1", "user_1")).rejects.toThrow(
      "Appointment not found"
    );
  });

  it("throws when user lacks permission", async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: "appt_1",
      customerId: "other_user",
      businessId: "biz_1",
      status: "CONFIRMED",
    });
    prisma.businessMembership.findFirst.mockResolvedValue(null);

    await expect(cancelAppointment("appt_1", "user_1")).rejects.toThrow(
      "You do not have permission"
    );
  });

  it("throws when appointment is not in CONFIRMED state", async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: "appt_1",
      customerId: "user_1",
      businessId: "biz_1",
      status: "COMPLETED",
    });

    await expect(cancelAppointment("appt_1", "user_1")).rejects.toThrow(
      "Only confirmed appointments can be cancelled"
    );
  });
});

describe("getCustomerAppointments", () => {
  it("returns appointments ordered by date", async () => {
    const mockAppointments = [
      { id: "appt_2", date: new Date("2026-12-02") },
      { id: "appt_1", date: new Date("2026-12-01") },
    ];
    prisma.appointment.findMany.mockResolvedValue(mockAppointments);

    const result = await getCustomerAppointments("user_1");
    expect(result).toHaveLength(2);
    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customerId: "user_1" },
      })
    );
  });
});

describe("getAvailableSlots", () => {
  it("returns empty array when business is closed", async () => {
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.businessHours.findUnique.mockResolvedValue({
      isClosed: true,
    });

    const result = await getAvailableSlots("biz_1", "svc_1", new Date("2026-12-01"));
    expect(result).toEqual([]);
  });

  it("returns empty array when no business hours exist", async () => {
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.businessHours.findUnique.mockResolvedValue(null);

    const result = await getAvailableSlots("biz_1", "svc_1", new Date("2026-12-01"));
    expect(result).toEqual([]);
  });

  it("throws when service is not found", async () => {
    prisma.service.findFirst.mockResolvedValue(null);

    await expect(
      getAvailableSlots("biz_1", "svc_999", new Date("2026-12-01"))
    ).rejects.toThrow("Service not found");
  });

  it("generates 15-minute interval slots for an open day", async () => {
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.businessHours.findUnique.mockResolvedValue({
      openTime: "09:00",
      closeTime: "10:00", // 1 hour window
      isClosed: false,
      breakStartTime: null,
      breakEndTime: null,
    });
    prisma.appointment.findMany.mockResolvedValue([]);

    const result = await getAvailableSlots("biz_1", "svc_1", new Date("2026-12-01"));
    // 09:00-09:30, 09:15-09:45, 09:30-10:00 = 3 slots
    expect(result.length).toBe(3);
    expect(result[0].startTime).toBe("09:00");
    expect(result[0].endTime).toBe("09:30");
    expect(result[0].available).toBe(true);
  });

  it("marks conflicting slots as unavailable", async () => {
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      durationMinutes: 30,
    });
    prisma.businessHours.findUnique.mockResolvedValue({
      openTime: "09:00",
      closeTime: "10:00",
      isClosed: false,
      breakStartTime: null,
      breakEndTime: null,
    });
    prisma.appointment.findMany.mockResolvedValue([
      { startTime: "09:00", endTime: "09:30" }, // first slot taken
    ]);

    const result = await getAvailableSlots("biz_1", "svc_1", new Date("2026-12-01"));
    expect(result[0].available).toBe(false); // 09:00-09:30 conflicts
    expect(result[1].available).toBe(false); // 09:15-09:45 also overlaps
    expect(result[2].available).toBe(true);  // 09:30-10:00 is free
  });
});
