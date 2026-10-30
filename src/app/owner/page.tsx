import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getBusinessesForOwner } from "@/server/services/business.service";
import { Store, Calendar, Users, Star, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description: "Manage your businesses, bookings, and queue on QueueLess.",
};

export default async function OwnerDashboardPage() {
  const user = await requireRole("SHOP_OWNER", "ADMIN");

  let businesses: Awaited<ReturnType<typeof getBusinessesForOwner>> = [];
  try {
    businesses = await getBusinessesForOwner(user.id);
  } catch {}

  const totalAppointments = businesses.reduce(
    (sum, b) => sum + ((b._count as Record<string, number>)?.appointments || 0),
    0
  );
  const totalQueueTickets = businesses.reduce(
    (sum, b) => sum + ((b._count as Record<string, number>)?.queueTickets || 0),
    0
  );
  const totalReviews = businesses.reduce(
    (sum, b) => sum + ((b._count as Record<string, number>)?.reviews || 0),
    0
  );

  const stats = [
    { label: "Businesses", value: businesses.length, icon: Store, color: "text-primary" },
    { label: "Appointments", value: totalAppointments, icon: Calendar, color: "text-success" },
    { label: "Queue Tickets", value: totalQueueTickets, icon: Users, color: "text-warning" },
    { label: "Reviews", value: totalReviews, icon: Star, color: "text-chart-3" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user.name.split(" ")[0]}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Businesses List */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Businesses</h2>
        <Button size="sm" variant="outline" className="gap-1.5" render={<Link href="/owner/register-business" />}>
          <Plus className="h-3.5 w-3.5" />
          Add New
        </Button>
      </div>

      {businesses.length > 0 ? (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <Link
              key={biz.id}
              href={`/owner/businesses/${biz.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30 group"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {biz.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(biz.category as Record<string, string>)?.name} • {biz.city}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No businesses yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Register your first business to start receiving bookings.
          </p>
          <Button className="mt-6 gap-2" render={<Link href="/owner/register-business" />}>
            <Plus className="h-4 w-4" />
            Register Business
          </Button>
        </div>
      )}
    </div>
  );
}
