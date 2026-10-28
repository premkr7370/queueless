"use server";

import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/auth.service";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/server/services/audit.service";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) throw new Error("Not authenticated");
  const user = await getSessionUser(token);
  if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
  return user;
}

// ──────────────────────────────────────────────
// Business verification
// ──────────────────────────────────────────────

export async function getBusinessesForVerificationAction() {
  try {
    await requireAdmin();
    return prisma.business.findMany({
      include: {
        category: { select: { name: true } },
        memberships: {
          where: { role: "OWNER" },
          include: { user: { select: { name: true, email: true } } },
          take: 1,
        },
        _count: { select: { appointments: true, queueTickets: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function verifyBusinessAction(
  businessId: string,
  status: "APPROVED" | "REJECTED",
  note?: string
) {
  try {
    const admin = await requireAdmin();

    await prisma.business.update({
      where: { id: businessId },
      data: {
        verificationStatus: status,
        verificationNote: note || null,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: `business.${status.toLowerCase()}`,
      entityType: "Business",
      entityId: businessId,
      details: { note },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

// ──────────────────────────────────────────────
// Commission policy management
// ──────────────────────────────────────────────

export async function getCommissionPoliciesAction() {
  try {
    await requireAdmin();
    return prisma.commissionPolicy.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function createCommissionPolicyAction(formData: FormData) {
  try {
    const admin = await requireAdmin();

    const name = formData.get("name") as string;
    const ratePercent = parseFloat(formData.get("ratePercent") as string);
    const minAmountPaise = formData.get("minAmountPaise")
      ? parseInt(formData.get("minAmountPaise") as string, 10)
      : null;
    const maxAmountPaise = formData.get("maxAmountPaise")
      ? parseInt(formData.get("maxAmountPaise") as string, 10)
      : null;

    if (!name || isNaN(ratePercent) || ratePercent < 0 || ratePercent > 100) {
      return { success: false, error: "Invalid input" };
    }

    // Deactivate all current policies
    await prisma.commissionPolicy.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new active policy
    const policy = await prisma.commissionPolicy.create({
      data: {
        name,
        ratePercent,
        minAmountPaise,
        maxAmountPaise,
        isActive: true,
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "commission_policy.created",
      entityType: "CommissionPolicy",
      entityId: policy.id,
      details: { name, ratePercent },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

// ──────────────────────────────────────────────
// Platform stats
// ──────────────────────────────────────────────

export async function getAdminStatsAction() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalBusinesses,
      pendingVerifications,
      totalAppointments,
      totalQueueTickets,
      totalPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.business.count({ where: { verificationStatus: "PENDING" } }),
      prisma.appointment.count(),
      prisma.queueTicket.count(),
      prisma.bookingPayment.count({ where: { paymentStatus: "CAPTURED" } }),
      prisma.bookingPayment.aggregate({
        where: { paymentStatus: "CAPTURED" },
        _sum: { commissionAmountPaise: true },
      }),
    ]);

    return {
      totalUsers,
      totalBusinesses,
      pendingVerifications,
      totalAppointments,
      totalQueueTickets,
      totalPayments,
      totalCommissionPaise: totalRevenue._sum.commissionAmountPaise || 0,
    };
  } catch {
    return {
      totalUsers: 0,
      totalBusinesses: 0,
      pendingVerifications: 0,
      totalAppointments: 0,
      totalQueueTickets: 0,
      totalPayments: 0,
      totalCommissionPaise: 0,
    };
  }
}

// ──────────────────────────────────────────────
// Audit logs
// ──────────────────────────────────────────────

export async function getAuditLogsAction(limit = 50) {
  try {
    await requireAdmin();
    return prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
// Review moderation
// ──────────────────────────────────────────────

export async function moderateReviewAction(reviewId: string, moderated: boolean) {
  try {
    const admin = await requireAdmin();

    await prisma.review.update({
      where: { id: reviewId },
      data: { isModerated: moderated },
    });

    await createAuditLog({
      userId: admin.id,
      action: moderated ? "review.moderated" : "review.unmoderated",
      entityType: "Review",
      entityId: reviewId,
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
