"use server";

import { cookies } from "next/headers";
import { createReviewSchema } from "@/lib/validations";
import { getSessionUser } from "@/server/services/auth.service";
import { createReview, getBusinessReviews } from "@/server/services/review.service";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) throw new Error("Not authenticated");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Invalid session");
  return user;
}

export async function createReviewAction(formData: FormData) {
  try {
    const user = await requireAuth();

    const parsed = createReviewSchema.safeParse({
      businessId: formData.get("businessId"),
      bookingId: formData.get("bookingId"),
      bookingType: formData.get("bookingType"),
      rating: parseInt(formData.get("rating") as string, 10),
      comment: formData.get("comment") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const review = await createReview(user.id, parsed.data);
    return { success: true, data: review };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit review" };
  }
}

export async function getBusinessReviewsAction(businessId: string, limit = 20, offset = 0) {
  return getBusinessReviews(businessId, limit, offset);
}
