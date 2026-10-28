import type { Metadata } from "next";
import { getBusinessesForVerificationAction } from "@/server/actions/admin.actions";
import { Badge } from "@/components/ui/badge";
import { Store, BadgeCheck, Clock, XCircle, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Verification",
  description: "Review and verify business listings.",
};

const STATUS_MAP: Record<string, { label: string; className: string; icon: typeof BadgeCheck }> = {
  APPROVED: { label: "Verified", className: "bg-success/10 text-success border-success/20", icon: BadgeCheck },
  PENDING: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  REJECTED: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default async function AdminBusinessesPage() {
  const businesses = await getBusinessesForVerificationAction();

  const pending = (businesses as Array<Record<string, unknown>>).filter(
    (b) => b.verificationStatus === "PENDING"
  );
  const others = (businesses as Array<Record<string, unknown>>).filter(
    (b) => b.verificationStatus !== "PENDING"
  );
  const sorted = [...pending, ...others];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Business Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage business listings ({pending.length} pending)
        </p>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((biz: Record<string, unknown>) => {
            const status = STATUS_MAP[(biz.verificationStatus as string) || "PENDING"] || STATUS_MAP.PENDING;
            const StatusIcon = status.icon;
            const memberships = (biz.memberships as Array<{ user: { name: string; email: string } }>) || [];
            const owner = memberships[0]?.user;
            const category = biz.category as { name: string } | null;
            const counts = biz._count as Record<string, number>;

            return (
              <div
                key={biz.id as string}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <div
                  className={`h-1 ${
                    biz.verificationStatus === "APPROVED"
                      ? "bg-success"
                      : biz.verificationStatus === "REJECTED"
                        ? "bg-destructive"
                        : "bg-warning"
                  }`}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold truncate">
                          {biz.name as string}
                        </h3>
                        <Badge variant="outline" className={`text-xs shrink-0 gap-1 ${status.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category?.name || "—"} •{" "}
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {biz.city as string}, {biz.state as string}
                        </span>
                      </p>
                    </div>
                  </div>

                  {owner && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Owner: <span className="font-medium text-foreground">{owner.name}</span>{" "}
                      ({owner.email})
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{counts?.appointments || 0} bookings</span>
                    <span>{counts?.queueTickets || 0} queue tickets</span>
                    <span>{counts?.reviews || 0} reviews</span>
                    <span className="ml-auto text-xs">
                      Created {new Date(biz.createdAt as string).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Store className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No businesses registered</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Businesses will appear here once owners register them.
          </p>
        </div>
      )}
    </div>
  );
}
