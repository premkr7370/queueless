"use server";

import { cookies } from "next/headers";
import { getSessionUser } from "@/server/services/auth.service";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server/services/notification.service";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) throw new Error("Not authenticated");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Invalid session");
  return user;
}

export async function getNotificationsAction() {
  try {
    const user = await requireAuth();
    return getUserNotifications(user.id);
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markReadAction(notificationId: string) {
  try {
    const user = await requireAuth();
    await markNotificationRead(notificationId, user.id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllReadAction() {
  try {
    const user = await requireAuth();
    await markAllNotificationsRead(user.id);
    return { success: true };
  } catch {
    return { success: false };
  }
}
