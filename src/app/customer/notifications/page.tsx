import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserNotifications } from "@/server/services/notification.service";
import { Bell, Calendar, Users, CheckCircle, AlertCircle, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your notifications on QueueLess.",
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  QUEUE_UPDATE: Users,
  APPOINTMENT_REMINDER: Calendar,
  BOOKING_CONFIRMATION: CheckCircle,
  BOOKING_CANCELLATION: AlertCircle,
  SYSTEM: Info,
};

export default async function NotificationsPage() {
  const user = await requireUser();

  let notifications: Awaited<ReturnType<typeof getUserNotifications>> = {
    notifications: [],
    unreadCount: 0,
  };
  try {
    notifications = await getUserNotifications(user.id);
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {notifications.unreadCount > 0
              ? `${notifications.unreadCount} unread`
              : "All caught up!"}
          </p>
        </div>
      </div>

      {notifications.notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-4 transition-colors ${
                  notif.isRead
                    ? "bg-card"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      notif.isRead ? "bg-muted" : "bg-primary/10"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        notif.isRead ? "text-muted-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm ${
                        notif.isRead ? "font-medium" : "font-semibold"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {notif.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No notifications</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            You&apos;ll receive updates about your bookings and queue status here.
          </p>
        </div>
      )}
    </div>
  );
}
