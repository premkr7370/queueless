import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import {
  LayoutDashboard,
  Store,
  Calendar,
  Users,
  Star,
  DollarSign,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const OWNER_NAV = [
  { href: "/owner", label: "Overview", icon: LayoutDashboard },
  { href: "/owner/businesses", label: "My Businesses", icon: Store },
  { href: "/owner/earnings", label: "Earnings", icon: DollarSign },
];

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/owner");
  if (user.role !== "SHOP_OWNER" && user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <>
      <Header user={user} />
      <div className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-60 shrink-0">
              <div className="rounded-2xl border bg-card p-5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Business Owner</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-0.5">
                  {OWNER_NAV.map((item) => (
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
              </div>

              <Button
                className="w-full gap-2"
                render={<Link href="/owner/register-business" />}
              >
                <Plus className="h-4 w-4" />
                Add Business
              </Button>
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
