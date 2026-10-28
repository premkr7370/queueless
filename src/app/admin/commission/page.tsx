import type { Metadata } from "next";
import { getCommissionPoliciesAction } from "@/server/actions/admin.actions";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Commission Policies",
  description: "Manage platform commission policies.",
};

export default async function AdminCommissionPage() {
  const policies = await getCommissionPoliciesAction();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Commission Policies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure platform commission rates for bookings
        </p>
      </div>

      {/* Current Active Policy */}
      {(policies as Array<Record<string, unknown>>).length > 0 && (
        <>
          {(policies as Array<Record<string, unknown>>).map((policy) => (
            <div
              key={policy.id as string}
              className={`rounded-xl border bg-card p-5 mb-3 ${
                policy.isActive ? "ring-2 ring-primary/20" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className={`h-4 w-4 ${policy.isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold">{String(policy.name)}</h3>
                  {policy.isActive === true && (
                    <Badge className="gap-1 text-xs bg-success/10 text-success border-success/20" variant="outline">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
                <span className="text-2xl font-bold text-primary">
                  {Number(policy.ratePercent)}%
                </span>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground">
                {policy.minAmountPaise != null && (
                  <span>Min: ₹{((policy.minAmountPaise as number) / 100).toFixed(2)}</span>
                )}
                {policy.maxAmountPaise != null && (
                  <span>Max: ₹{((policy.maxAmountPaise as number) / 100).toFixed(2)}</span>
                )}
                <span className="ml-auto">
                  Effective from{" "}
                  {new Date(policy.effectiveFrom as string).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </>
      )}

      {(policies as Array<Record<string, unknown>>).length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <DollarSign className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No commission policies</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Run the database seed to create the default 10% commission policy.
          </p>
        </div>
      )}
    </div>
  );
}
