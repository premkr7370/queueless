"use server";

import { cookies } from "next/headers";
import { createBusinessSchema, updateBusinessSchema, searchBusinessesSchema } from "@/lib/validations";
import { getSessionUser } from "@/server/services/auth.service";
import {
  createBusiness,
  updateBusiness,
  searchBusinesses,
  getBusinessBySlug,
  getBusinessesForOwner,
} from "@/server/services/business.service";

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

export async function createBusinessAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (user.role !== "SHOP_OWNER" && user.role !== "ADMIN") {
      return { success: false, error: "Only business owners can create listings" };
    }

    const parsed = createBusinessSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
      website: formData.get("website") || undefined,
      categoryId: formData.get("categoryId"),
      timezone: formData.get("timezone") || "Asia/Kolkata",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const business = await createBusiness(user.id, parsed.data);
    return { success: true, data: { slug: business.slug } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create business" };
  }
}

export async function updateBusinessAction(
  businessId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const parsed = updateBusinessSchema.safeParse({
      name: formData.get("name") || undefined,
      description: formData.get("description") || undefined,
      address: formData.get("address") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      pincode: formData.get("pincode") || undefined,
      phone: formData.get("phone") || undefined,
      email: formData.get("email") || undefined,
      website: formData.get("website") || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    await updateBusiness(businessId, user.id, parsed.data);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update" };
  }
}

export async function searchBusinessesAction(params: {
  q?: string;
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}) {
  const parsed = searchBusinessesSchema.safeParse({
    q: params.q,
    category: params.category,
    city: params.city,
    page: params.page || 1,
    limit: params.limit || 12,
    sortBy: params.sortBy || "relevance",
  });

  if (!parsed.success) {
    return { businesses: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  }

  return searchBusinesses(parsed.data);
}

export async function getBusinessBySlugAction(slug: string) {
  return getBusinessBySlug(slug);
}

export async function getOwnerBusinessesAction() {
  try {
    const user = await requireAuth();
    return getBusinessesForOwner(user.id);
  } catch {
    return [];
  }
}
