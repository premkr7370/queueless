/**
 * Queue service — server-only business logic for the virtual queue system.
 *
 * Token allocation uses an atomic database increment to prevent duplicates
 * under concurrent access.
 */

import { prisma } from "@/lib/db";
import type { JoinQueueInput } from "@/lib/validations";

/**
 * Join a walk-in queue for a business.
 * Atomically allocates the next token number for today.
 */
export async function joinQueue(customerId: string, input: JoinQueueInput) {
  const { businessId, serviceId } = input;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verify business exists and is active
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, isActive: true, name: true },
  });

  if (!business || !business.isActive) {
    throw new Error("Business not found or is inactive");
  }

  // Verify service exists and belongs to business
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  });

  if (!service) {
    throw new Error("Service not found or is inactive");
  }

  // Check if customer already has an active ticket today
  const existingTicket = await prisma.queueTicket.findFirst({
    where: {
      customerId,
      businessId,
      date: today,
      status: { in: ["WAITING", "CALLED"] },
    },
  });

  if (existingTicket) {
    throw new Error("You already have an active queue ticket for this business today");
  }

  // Atomic token allocation using upsert + increment
  const ticket = await prisma.$transaction(async (tx) => {
    const counter = await tx.queueCounter.upsert({
      where: { businessId_date: { businessId, date: today } },
      update: { lastTokenNumber: { increment: 1 } },
      create: { businessId, date: today, lastTokenNumber: 1 },
    });

    // Calculate estimated wait based on people ahead
    const waitingCount = await tx.queueTicket.count({
      where: {
        businessId,
        date: today,
        status: { in: ["WAITING", "CALLED", "SERVING"] },
      },
    });

    const estimatedWaitMinutes = waitingCount * service.durationMinutes;

    return tx.queueTicket.create({
      data: {
        businessId,
        serviceId,
        customerId,
        tokenNumber: counter.lastTokenNumber,
        date: today,
        status: "WAITING",
        estimatedWaitMinutes,
      },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        business: { select: { name: true } },
      },
    });
  });

  return ticket;
}

/**
 * Get the current queue status for a business.
 * Returns only public-safe data (no customer names or private info).
 */
export async function getQueueStatus(businessId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentlyServing, waitingTickets, completedToday] = await Promise.all([
    prisma.queueTicket.findFirst({
      where: { businessId, date: today, status: "SERVING" },
      select: { tokenNumber: true, serviceId: true },
      orderBy: { calledAt: "asc" },
    }),
    prisma.queueTicket.count({
      where: { businessId, date: today, status: { in: ["WAITING", "CALLED"] } },
    }),
    prisma.queueTicket.count({
      where: { businessId, date: today, status: "COMPLETED" },
    }),
  ]);

  return {
    currentlyServing: currentlyServing?.tokenNumber ?? null,
    waitingCount: waitingTickets,
    completedToday,
    isActive: true,
  };
}

/**
 * Call the next person in the queue.
 * Only callable by business staff/owner.
 */
export async function callNextInQueue(businessId: string, staffUserId: string) {
  // Verify staff membership
  const membership = await prisma.businessMembership.findFirst({
    where: { businessId, userId: staffUserId },
  });

  if (!membership) {
    throw new Error("You do not have permission to manage this queue");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextTicket = await prisma.queueTicket.findFirst({
    where: { businessId, date: today, status: "WAITING" },
    orderBy: { tokenNumber: "asc" },
  });

  if (!nextTicket) {
    return null; // No one waiting
  }

  const updated = await prisma.queueTicket.update({
    where: { id: nextTicket.id },
    data: { status: "CALLED", calledAt: new Date() },
    include: {
      service: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  return updated;
}

/**
 * Mark a ticket as "serving" (customer has arrived at the counter).
 */
export async function startServing(ticketId: string, staffUserId: string) {
  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
    select: { businessId: true, status: true },
  });

  if (!ticket || ticket.status !== "CALLED") {
    throw new Error("Ticket not found or not in CALLED state");
  }

  const membership = await prisma.businessMembership.findFirst({
    where: { businessId: ticket.businessId, userId: staffUserId },
  });

  if (!membership) {
    throw new Error("Permission denied");
  }

  return prisma.queueTicket.update({
    where: { id: ticketId },
    data: { status: "SERVING", servingStartedAt: new Date() },
  });
}

/**
 * Mark a ticket as completed.
 */
export async function completeTicket(ticketId: string, staffUserId: string) {
  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
    select: { businessId: true, status: true },
  });

  if (!ticket || !["CALLED", "SERVING"].includes(ticket.status)) {
    throw new Error("Ticket not found or not in a servable state");
  }

  const membership = await prisma.businessMembership.findFirst({
    where: { businessId: ticket.businessId, userId: staffUserId },
  });

  if (!membership) {
    throw new Error("Permission denied");
  }

  return prisma.queueTicket.update({
    where: { id: ticketId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

/**
 * Get a customer's active queue tickets.
 */
export async function getCustomerTickets(customerId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.queueTicket.findMany({
    where: {
      customerId,
      date: { gte: today },
      status: { in: ["WAITING", "CALLED", "SERVING"] },
    },
    include: {
      business: { select: { name: true, slug: true } },
      service: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
