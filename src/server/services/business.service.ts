/**
 * Business service — server-only business logic for business CRUD.
 */

import { prisma } from "@/lib/db";
import type { CreateBusinessInput, UpdateBusinessInput, SearchBusinessesInput } from "@/lib/validations";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export async function createBusiness(ownerId: string, input: CreateBusinessInput) {
  let slug = generateSlug(input.name);

  // Ensure unique slug
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const business = await prisma.$transaction(async (tx) => {
    const biz = await tx.business.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        phone: input.phone || null,
        email: input.email || null,
        website: input.website || null,
        categoryId: input.categoryId,
        timezone: input.timezone,
      },
    });

    // Create owner membership
    await tx.businessMembership.create({
      data: {
        userId: ownerId,
        businessId: biz.id,
        role: "OWNER",
      },
    });

    // Create default business hours (Mon-Sat 9-18, Sun closed)
    await tx.businessHours.createMany({
      data: Array.from({ length: 7 }, (_, day) => ({
        businessId: biz.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: day === 0,
      })),
    });

    return biz;
  });

  return business;
}

export async function updateBusiness(
  businessId: string,
  userId: string,
  input: UpdateBusinessInput
) {
  // Verify membership
  const membership = await prisma.businessMembership.findFirst({
    where: {
      businessId,
      userId,
      role: { in: ["OWNER", "MANAGER"] },
    },
  });

  if (!membership) {
    throw new Error("You do not have permission to update this business");
  }

  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      ...input,
      phone: input.phone || undefined,
      email: input.email || undefined,
      website: input.website || undefined,
    },
  });

  return business;
}

export async function getBusinessBySlug(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      category: true,
      services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      businessHours: { orderBy: { dayOfWeek: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: { select: { name: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });

  return business;
}

export async function searchBusinesses(input: SearchBusinessesInput) {
  const { page, limit, q, category, city, sortBy } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isActive: true,
    verificationStatus: "APPROVED",
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "name":
      orderBy.name = "asc";
      break;
    case "newest":
      orderBy.createdAt = "desc";
      break;
    default:
      orderBy.name = "asc";
  }

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.business.count({ where }),
  ]);

  return {
    businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBusinessesForOwner(userId: string) {
  const memberships = await prisma.businessMembership.findMany({
    where: { userId },
    include: {
      business: {
        include: {
          category: { select: { name: true } },
          _count: { select: { appointments: true, queueTickets: true, reviews: true } },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.business,
    membershipRole: m.role,
  }));
}
