/**
 * Auth service — server-only business logic for authentication.
 *
 * NOTE: This uses a simple bcrypt-based password hashing approach.
 * In Phase 3, this will be replaced with Better Auth integration.
 * For now, it provides the interface and basic logic.
 */

import { prisma } from "@/lib/db";
import { type RegisterInput, type LoginInput } from "@/lib/validations";

// Placeholder hash functions — will be replaced with proper bcrypt in Phase 3
async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or argon2
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "queueless_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone || null,
      passwordHash,
      role: input.role === "SHOP_OWNER" ? "SHOP_OWNER" : "CUSTOMER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
    },
  };
}

export async function getSessionUser(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function logoutUser(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}
