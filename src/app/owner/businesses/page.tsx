import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getBusinessesForOwner } from "@/server/services/business.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Store,
  Plus,
  Calendar,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Businesses",
  description: "Manage your business listings on QueueLess.",
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Verified", className: "bg-success/10 text-success border-success/20" },
  PENDING: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  REJECTED: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default async function OwnerBusinessesPage() {
  const user = await requireRole("SHOP_OWNER", "ADMIN");

  let businesses: Awaited<ReturnType<typeof getBusinessesForOwner>> = [];
  try {
    businesses = await getBusinessesForOwner(user.id);
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">My Businesses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {businesses.length} business{businesses.length !== 1 ? "es" : ""} registered
          </p>
        </div>
        <Button size="sm" className="gap-2" render={<Link href="/owner/register-business" />}>
          <Plus className="h-4 w-4" />
          Add Business
        </Button>
      </div>

      {businesses.length > 0 ? (
        <div className="space-y-4">
          {businesses.map((biz) => {
            const status = STATUS_MAP[biz.verificationStatus] || STATUS_MAP.PENDING;
            const counts = biz._count as Record<string, number>;
            return (
              <div
                key={biz.id}
                className="rounded-2xl border bg-card overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold truncate">
                          {biz.name}
                        </h3>
                        <Badge variant="outline" className={`text-xs shrink-0 ${status.className}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(biz.category as Record<string, string>)?.name} • {biz.address}, {biz.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {counts?.appointments || 0} bookings
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {counts?.queueTickets || 0} queue tickets
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {counts?.reviews || 0} reviews
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      render={<Link href={`/owner/businesses/${biz.id}`} />}
                    >
                      Manage
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs"
                      render={<Link href={`/business/${biz.slug}`} />}
                    >
                      View Public Page
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No businesses yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            List your first business on QueueLess.
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
