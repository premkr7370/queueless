/**
 * Server-side auth helper.
 * Reads the session cookie and returns the current user.
 */

import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/auth.service";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "SHOP_OWNER" | "ADMIN";
};

/**
 * Get the current authenticated user from the session cookie.
 * Returns null if not authenticated or session is expired.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  const user = await getSessionUser(token);
  return user as SessionUser | null;
}

/**
 * Require authentication — throws redirect if not logged in.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    // redirect() throws internally and never returns,
    // but TypeScript needs help understanding this.
  }
  return user as SessionUser;
}

/**
 * Require a specific role — throws redirect if unauthorized.
 */
export async function requireRole(
  ...roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    const { redirect } = await import("next/navigation");
    redirect("/");
  }
  return user;
}
