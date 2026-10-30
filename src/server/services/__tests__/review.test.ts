/**
 * Review service unit tests.
 *
 * Tests review creation with booking verification,
 * duplicate prevention, and business review aggregation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getPrismaMock, resetAllMocks } from "./prisma.mock";

import "./prisma.mock";
import {
  createReview,
  getBusinessReviews,
  moderateReview,
} from "@/server/services/review.service";

let prisma: Awaited<ReturnType<typeof getPrismaMock>>;

beforeEach(async () => {
  resetAllMocks();
  prisma = await getPrismaMock();
});

describe("createReview", () => {
  it("creates a review for a completed appointment", async () => {
    prisma.appointment.findFirst.mockResolvedValue({
      id: "appt_1",
      customerId: "user_1",
      status: "COMPLETED",
    });
    prisma.review.findUnique.mockResolvedValue(null); // no duplicate
    prisma.review.create.mockResolvedValue({
      id: "rev_1",
      rating: 5,
      comment: "Excellent!",
      businessId: "biz_1",
    });

    const result = await createReview("user_1", {
      businessId: "biz_1",
      bookingId: "appt_1",
      bookingType: "APPOINTMENT",
      rating: 5,
      comment: "Excellent!",
    });

    expect(result.rating).toBe(5);
    expect(prisma.review.create).toHaveBeenCalled();
  });

  it("creates a review for a completed queue ticket", async () => {
    prisma.queueTicket.findFirst.mockResolvedValue({
      id: "ticket_1",
      customerId: "user_1",
      status: "COMPLETED",
    });
    prisma.review.findUnique.mockResolvedValue(null);
    prisma.review.create.mockResolvedValue({
      id: "rev_2",
      rating: 4,
      bookingType: "QUEUE_TICKET",
    });

    const result = await createReview("user_1", {
      businessId: "biz_1",
      bookingId: "ticket_1",
      bookingType: "QUEUE_TICKET",
      rating: 4,
    });

    expect(result.rating).toBe(4);
  });

  it("throws when appointment is not completed", async () => {
    prisma.appointment.findFirst.mockResolvedValue(null);

    await expect(
      createReview("user_1", {
        businessId: "biz_1",
        bookingId: "appt_1",
        bookingType: "APPOINTMENT",
        rating: 5,
      })
    ).rejects.toThrow("Appointment not found or not completed");
  });

  it("throws when queue ticket is not completed", async () => {
    prisma.queueTicket.findFirst.mockResolvedValue(null);

    await expect(
      createReview("user_1", {
        businessId: "biz_1",
        bookingId: "ticket_1",
        bookingType: "QUEUE_TICKET",
        rating: 5,
      })
    ).rejects.toThrow("Queue ticket not found or not completed");
  });

  it("throws when a duplicate review already exists", async () => {
    prisma.appointment.findFirst.mockResolvedValue({
      id: "appt_1",
      customerId: "user_1",
      status: "COMPLETED",
    });
    prisma.review.findUnique.mockResolvedValue({
      id: "existing_rev",
    });

    await expect(
      createReview("user_1", {
        businessId: "biz_1",
        bookingId: "appt_1",
        bookingType: "APPOINTMENT",
        rating: 3,
      })
    ).rejects.toThrow("You have already reviewed this booking");
  });
});

describe("getBusinessReviews", () => {
  it("returns reviews with stats", async () => {
    prisma.review.findMany.mockResolvedValue([
      { id: "r1", rating: 5, customer: { name: "Alice" } },
      { id: "r2", rating: 4, customer: { name: "Bob" } },
    ]);
    prisma.review.count.mockResolvedValue(10);
    prisma.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: { rating: 10 },
    });

    const result = await getBusinessReviews("biz_1");
    expect(result.reviews).toHaveLength(2);
    expect(result.total).toBe(10);
    expect(result.averageRating).toBe(4.5);
    expect(result.reviewCount).toBe(10);
  });

  it("handles no reviews", async () => {
    prisma.review.findMany.mockResolvedValue([]);
    prisma.review.count.mockResolvedValue(0);
    prisma.review.aggregate.mockResolvedValue({
      _avg: { rating: null },
      _count: { rating: 0 },
    });

    const result = await getBusinessReviews("biz_1");
    expect(result.reviews).toHaveLength(0);
    expect(result.averageRating).toBeNull();
  });
});

describe("moderateReview", () => {
  it("marks a review as moderated", async () => {
    prisma.review.update.mockResolvedValue({
      id: "rev_1",
      isModerated: true,
    });

    const result = await moderateReview("rev_1", true);
    expect(result.isModerated).toBe(true);
    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: "rev_1" },
      data: { isModerated: true },
    });
  });

  it("unmarks a moderated review", async () => {
    prisma.review.update.mockResolvedValue({
      id: "rev_1",
      isModerated: false,
    });

    const result = await moderateReview("rev_1", false);
    expect(result.isModerated).toBe(false);
  });
});
