/**
 * Queue service unit tests.
 *
 * Tests queue joining, token allocation, queue status,
 * call next, start serving, and complete ticket flows.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getPrismaMock, resetAllMocks } from "./prisma.mock";

import "./prisma.mock";
import {
  joinQueue,
  getQueueStatus,
  callNextInQueue,
  startServing,
  completeTicket,
  getCustomerTickets,
} from "@/server/services/queue.service";

let prisma: Awaited<ReturnType<typeof getPrismaMock>>;

beforeEach(async () => {
  resetAllMocks();
  prisma = await getPrismaMock();
});

describe("joinQueue", () => {
  const validInput = {
    businessId: "biz_1",
    serviceId: "svc_1",
  };

  it("creates a queue ticket with atomic token allocation", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      name: "Test Business",
    });
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      businessId: "biz_1",
      isActive: true,
      durationMinutes: 15,
    });
    prisma.queueTicket.findFirst.mockResolvedValue(null); // no existing ticket
    prisma.queueCounter.upsert.mockResolvedValue({
      lastTokenNumber: 5,
    });
    prisma.queueTicket.count.mockResolvedValue(4); // 4 people ahead
    prisma.queueTicket.create.mockResolvedValue({
      id: "ticket_1",
      tokenNumber: 5,
      status: "WAITING",
      estimatedWaitMinutes: 60,
      service: { name: "Haircut", durationMinutes: 15 },
      business: { name: "Test Business" },
    });

    const result = await joinQueue("user_1", validInput);
    expect(result.tokenNumber).toBe(5);
    expect(result.status).toBe("WAITING");
  });

  it("throws when business is inactive", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: false,
    });

    await expect(joinQueue("user_1", validInput)).rejects.toThrow(
      "Business not found or is inactive"
    );
  });

  it("throws when service is not found", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      name: "Test",
    });
    prisma.service.findFirst.mockResolvedValue(null);

    await expect(joinQueue("user_1", validInput)).rejects.toThrow(
      "Service not found or is inactive"
    );
  });

  it("throws when customer already has an active ticket", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz_1",
      isActive: true,
      name: "Test",
    });
    prisma.service.findFirst.mockResolvedValue({
      id: "svc_1",
      businessId: "biz_1",
      isActive: true,
    });
    prisma.queueTicket.findFirst.mockResolvedValue({
      id: "existing_ticket",
      status: "WAITING",
    });

    await expect(joinQueue("user_1", validInput)).rejects.toThrow(
      "You already have an active queue ticket"
    );
  });
});

describe("getQueueStatus", () => {
  it("returns current queue status", async () => {
    prisma.queueTicket.findFirst.mockResolvedValue({
      tokenNumber: 3,
      serviceId: "svc_1",
    });
    prisma.queueTicket.count
      .mockResolvedValueOnce(5) // waiting
      .mockResolvedValueOnce(10); // completed

    const result = await getQueueStatus("biz_1");
    expect(result.currentlyServing).toBe(3);
    expect(result.waitingCount).toBe(5);
    expect(result.completedToday).toBe(10);
    expect(result.isActive).toBe(true);
  });

  it("returns null for currentlyServing when no one is being served", async () => {
    prisma.queueTicket.findFirst.mockResolvedValue(null);
    prisma.queueTicket.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await getQueueStatus("biz_1");
    expect(result.currentlyServing).toBeNull();
    expect(result.waitingCount).toBe(0);
  });
});

describe("callNextInQueue", () => {
  it("calls the next waiting ticket", async () => {
    prisma.businessMembership.findFirst.mockResolvedValue({
      id: "mem_1",
      userId: "staff_1",
      role: "OWNER",
    });
    prisma.queueTicket.findFirst.mockResolvedValue({
      id: "ticket_1",
      tokenNumber: 1,
      status: "WAITING",
    });
    prisma.queueTicket.update.mockResolvedValue({
      id: "ticket_1",
      status: "CALLED",
      calledAt: new Date(),
      service: { name: "Haircut" },
      customer: { name: "Test User" },
    });

    const result = await callNextInQueue("biz_1", "staff_1");
    expect(result?.status).toBe("CALLED");
  });

  it("returns null when no one is waiting", async () => {
    prisma.businessMembership.findFirst.mockResolvedValue({
      id: "mem_1",
    });
    prisma.queueTicket.findFirst.mockResolvedValue(null);

    const result = await callNextInQueue("biz_1", "staff_1");
    expect(result).toBeNull();
  });

  it("throws when staff has no permission", async () => {
    prisma.businessMembership.findFirst.mockResolvedValue(null);

    await expect(callNextInQueue("biz_1", "random_user")).rejects.toThrow(
      "You do not have permission"
    );
  });
});

describe("startServing", () => {
  it("transitions CALLED ticket to SERVING", async () => {
    prisma.queueTicket.findUnique.mockResolvedValue({
      businessId: "biz_1",
      status: "CALLED",
    });
    prisma.businessMembership.findFirst.mockResolvedValue({
      id: "mem_1",
    });
    prisma.queueTicket.update.mockResolvedValue({
      status: "SERVING",
      servingStartedAt: new Date(),
    });

    const result = await startServing("ticket_1", "staff_1");
    expect(result.status).toBe("SERVING");
  });

  it("throws for non-CALLED tickets", async () => {
    prisma.queueTicket.findUnique.mockResolvedValue({
      businessId: "biz_1",
      status: "WAITING",
    });

    await expect(startServing("ticket_1", "staff_1")).rejects.toThrow(
      "not in CALLED state"
    );
  });
});

describe("completeTicket", () => {
  it("completes a SERVING ticket", async () => {
    prisma.queueTicket.findUnique.mockResolvedValue({
      businessId: "biz_1",
      status: "SERVING",
    });
    prisma.businessMembership.findFirst.mockResolvedValue({
      id: "mem_1",
    });
    prisma.queueTicket.update.mockResolvedValue({
      status: "COMPLETED",
      completedAt: new Date(),
    });

    const result = await completeTicket("ticket_1", "staff_1");
    expect(result.status).toBe("COMPLETED");
  });

  it("completes a CALLED ticket (skipping SERVING)", async () => {
    prisma.queueTicket.findUnique.mockResolvedValue({
      businessId: "biz_1",
      status: "CALLED",
    });
    prisma.businessMembership.findFirst.mockResolvedValue({
      id: "mem_1",
    });
    prisma.queueTicket.update.mockResolvedValue({
      status: "COMPLETED",
    });

    const result = await completeTicket("ticket_1", "staff_1");
    expect(result.status).toBe("COMPLETED");
  });

  it("throws for WAITING tickets", async () => {
    prisma.queueTicket.findUnique.mockResolvedValue({
      businessId: "biz_1",
      status: "WAITING",
    });

    await expect(completeTicket("ticket_1", "staff_1")).rejects.toThrow(
      "not in a servable state"
    );
  });
});

describe("getCustomerTickets", () => {
  it("returns active tickets for a customer", async () => {
    prisma.queueTicket.findMany.mockResolvedValue([
      { id: "t1", status: "WAITING" },
      { id: "t2", status: "CALLED" },
    ]);

    const result = await getCustomerTickets("user_1");
    expect(result).toHaveLength(2);
  });
});
