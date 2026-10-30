"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Calendar,
  LayoutDashboard,
  Store,
  Shield,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dashboardLink =
    user.role === "ADMIN"
      ? "/admin"
      : user.role === "SHOP_OWNER"
        ? "/owner"
        : "/customer/bookings";

  const dashboardLabel =
    user.role === "ADMIN"
      ? "Admin Panel"
      : user.role === "SHOP_OWNER"
        ? "Dashboard"
        : "My Bookings";

  const DashboardIcon =
    user.role === "ADMIN"
      ? Shield
      : user.role === "SHOP_OWNER"
        ? Store
        : Calendar;

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
    });
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        id="user-menu-btn"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {initials}
        </div>
        <span className="hidden xl:inline max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      <div className="invisible absolute right-0 top-full z-50 mt-1 w-56 origin-top-right scale-95 rounded-xl border bg-card p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
        <div className="border-b px-3 py-2.5 mb-1">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <Link
          href={dashboardLink}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
        >
          <DashboardIcon className="h-4 w-4 text-muted-foreground" />
          {dashboardLabel}
        </Link>

        {user.role === "CUSTOMER" && (
          <Link
            href="/customer/queue"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            My Queue
          </Link>
        )}

        <div className="my-1 h-px bg-border" />

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign Out
        </button>
      </div>
    </div>
  );
}
