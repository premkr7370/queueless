/**
 * Audit logging utility.
 * Records privileged actions for security and compliance.
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function createAuditLog(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: (params.details as Prisma.InputJsonValue) || undefined,
      ipAddress: params.ipAddress || null,
    },
  });
}

export async function getAuditLogs(params: {
  userId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, entityType, entityId, limit = 50, offset = 0 } = params;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  return prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
