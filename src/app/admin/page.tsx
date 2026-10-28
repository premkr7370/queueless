import type { Metadata } from "next";
import { getAdminStatsAction } from "@/server/actions/admin.actions";
import { formatCurrency } from "@/lib/commission";
import {
  Users,
  Store,
  Calendar,
  Ticket,
  DollarSign,
  AlertTriangle,
  CreditCard,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "QueueLess platform administration.",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStatsAction();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Businesses", value: stats.totalBusinesses, icon: Store, color: "text-success" },
    {
      label: "Pending Verification",
      value: stats.pendingVerifications,
      icon: AlertTriangle,
      color: stats.pendingVerifications > 0 ? "text-warning" : "text-muted-foreground",
    },
    { label: "Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-chart-1" },
    { label: "Queue Tickets", value: stats.totalQueueTickets, icon: Ticket, color: "text-chart-3" },
    { label: "Payments", value: stats.totalPayments, icon: CreditCard, color: "text-chart-2" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform overview and administration
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs font-medium text-muted-foreground">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Commission Revenue */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Platform Commission
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(stats.totalCommissionPaise)}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Earned from {stats.totalPayments} completed payment{stats.totalPayments !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
