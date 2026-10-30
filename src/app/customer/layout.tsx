export const instant = false;

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import { Calendar, Users, Bell } from "lucide-react";

const CUSTOMER_NAV = [
  { href: "/customer/bookings", label: "My Bookings", icon: Calendar },
  { href: "/customer/queue", label: "My Queue", icon: Users },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/customer/bookings");
  if (user.role !== "CUSTOMER" && user.role !== "ADMIN") redirect("/");

  return (
    <>
      <Header user={user} />
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-56 shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>

              <nav className="flex lg:flex-col gap-1">
                {CUSTOMER_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
