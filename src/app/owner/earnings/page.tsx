import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/commission";
import { DollarSign, TrendingDown, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Earnings",
  description: "View your earnings and payment history on QueueLess.",
};

export default async function EarningsPage() {
  const user = await requireRole("SHOP_OWNER", "ADMIN");

  // Get businesses owned by this user
  const memberships = await prisma.businessMembership.findMany({
    where: { userId: user.id },
    select: { businessId: true },
  });
  const businessIds = memberships.map((m) => m.businessId);

  // Get payments for these businesses
  const payments = await prisma.bookingPayment.findMany({
    where: {
      OR: [
        { appointment: { businessId: { in: businessIds } } },
        { queueTicket: { businessId: { in: businessIds } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      appointment: { select: { business: { select: { name: true } } } },
      queueTicket: { select: { business: { select: { name: true } } } },
    },
  });

  const totalGross = payments
    .filter((p) => p.paymentStatus === "CAPTURED")
    .reduce((sum, p) => sum + p.grossAmountPaise, 0);

  const totalCommission = payments
    .filter((p) => p.paymentStatus === "CAPTURED")
    .reduce((sum, p) => sum + p.commissionAmountPaise, 0);

  const totalOwnerShare = payments
    .filter((p) => p.paymentStatus === "CAPTURED")
    .reduce((sum, p) => sum + p.ownerSharePaise, 0);

  const stats = [
    { label: "Total Revenue", value: totalGross, icon: DollarSign, color: "text-primary" },
    { label: "Your Earnings", value: totalOwnerShare, icon: Wallet, color: "text-success" },
    { label: "Platform Commission", value: totalCommission, icon: TrendingDown, color: "text-warning" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue breakdown and payment history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <h2 className="text-lg font-semibold mb-4">Payment History</h2>
      {payments.length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Business</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Your Share</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const bizName =
                    payment.appointment?.business?.name ||
                    payment.queueTicket?.business?.name ||
                    "—";
                  return (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{bizName}</td>
                      <td className="px-4 py-3">{formatCurrency(payment.grossAmountPaise)}</td>
                      <td className="px-4 py-3 text-success font-medium">
                        {formatCurrency(payment.ownerSharePaise)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            payment.paymentStatus === "CAPTURED"
                              ? "bg-success/10 text-success"
                              : payment.paymentStatus === "REFUNDED"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warning/10 text-warning"
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          <DollarSign className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          No payments yet. Revenue will appear here once bookings are paid.
        </div>
      )}
    </div>
  );
}
