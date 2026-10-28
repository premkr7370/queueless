/**
 * Review service — server-only business logic for reviews.
 */

import { prisma } from "@/lib/db";
import type { CreateReviewInput } from "@/lib/validations";

export async function createReview(customerId: string, input: CreateReviewInput) {
  // Verify the booking exists and belongs to customer
  if (input.bookingType === "APPOINTMENT") {
    const appointment = await prisma.appointment.findFirst({
      where: { id: input.bookingId, customerId, status: "COMPLETED" },
    });
    if (!appointment) {
      throw new Error("Appointment not found or not completed");
    }
  } else {
    const ticket = await prisma.queueTicket.findFirst({
      where: { id: input.bookingId, customerId, status: "COMPLETED" },
    });
    if (!ticket) {
      throw new Error("Queue ticket not found or not completed");
    }
  }

  // Check for duplicate review
  const existing = await prisma.review.findUnique({
    where: { customerId_bookingId: { customerId, bookingId: input.bookingId } },
  });

  if (existing) {
    throw new Error("You have already reviewed this booking");
  }

  return prisma.review.create({
    data: {
      businessId: input.businessId,
      customerId,
      bookingId: input.bookingId,
      bookingType: input.bookingType,
      rating: input.rating,
      comment: input.comment || null,
    },
  });
}

export async function getBusinessReviews(businessId: string, limit = 20, offset = 0) {
  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where: { businessId, isModerated: false },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.review.count({ where: { businessId } }),
    prisma.review.aggregate({
      where: { businessId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    reviews,
    total,
    averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : null,
    reviewCount: stats._count.rating,
  };
}

export async function moderateReview(reviewId: string, moderated: boolean) {
  return prisma.review.update({
    where: { id: reviewId },
    data: { isModerated: moderated },
  });
}
