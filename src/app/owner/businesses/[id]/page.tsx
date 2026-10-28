import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/commission";
import {
  Calendar,
  Users,
  Star,
  Settings,
  ArrowLeft,
  Clock,
  Hash,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Business",
  description: "Manage your business on QueueLess.",
};

interface ManageBusinessPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageBusinessPage({ params }: ManageBusinessPageProps) {
  const user = await requireRole("SHOP_OWNER", "ADMIN");
  const { id } = await params;

  // Verify ownership
  const membership = await prisma.businessMembership.findFirst({
    where: { businessId: id, userId: user.id },
  });

  if (!membership) notFound();

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      category: true,
      services: { orderBy: { sortOrder: "asc" } },
      _count: { select: { appointments: true, queueTickets: true, reviews: true } },
    },
  });

  if (!business) notFound();

  // Get today's queue
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTickets = await prisma.queueTicket.findMany({
    where: { businessId: id, date: today },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
    orderBy: { tokenNumber: "asc" },
  });

  const todayAppointments = await prisma.appointment.findMany({
    where: { businessId: id, date: today },
    include: {
      customer: { select: { name: true, phone: true } },
      service: { select: { name: true, durationMinutes: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const waitingCount = todayTickets.filter((t) => t.status === "WAITING").length;
  const servingTicket = todayTickets.find((t) => t.status === "SERVING");

  const TICKET_STATUS_STYLES: Record<string, string> = {
    WAITING: "bg-warning/10 text-warning",
    CALLED: "bg-primary/10 text-primary",
    SERVING: "bg-success/10 text-success",
    COMPLETED: "bg-muted text-muted-foreground",
    CANCELLED: "bg-destructive/10 text-destructive",
    NO_SHOW: "bg-muted text-muted-foreground",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/owner/businesses" className="hover:text-foreground transition-colors">
          My Businesses
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground truncate">{business.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{business.name}</h1>
          <p className="text-sm text-muted-foreground">
            {business.category.name} • {business.city}
          </p>
        </div>
        <Button size="sm" variant="outline" render={<Link href={`/business/${business.slug}`} />}>
          View Public Page
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{todayAppointments.length}</p>
          <p className="text-xs text-muted-foreground">Today&apos;s Appointments</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="h-5 w-5 text-warning mx-auto mb-1" />
          <p className="text-2xl font-bold">{waitingCount}</p>
          <p className="text-xs text-muted-foreground">In Queue</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <Hash className="h-5 w-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold">{servingTicket?.tokenNumber || "—"}</p>
          <p className="text-xs text-muted-foreground">Now Serving</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Today's Queue */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Today&apos;s Queue
          </h2>
          {todayTickets.length > 0 ? (
            <div className="space-y-2">
              {todayTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      #{ticket.tokenNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ticket.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{ticket.service.name}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${TICKET_STATUS_STYLES[ticket.status]}`}>
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No queue tickets for today
            </div>
          )}
        </section>

        {/* Today's Appointments */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today&apos;s Appointments
          </h2>
          {todayAppointments.length > 0 ? (
            <div className="space-y-2">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                      <Clock className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appt.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.service.name} • {appt.startTime}–{appt.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      appt.status === "CONFIRMED"
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {appt.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No appointments for today
            </div>
          )}
        </section>
      </div>

      {/* Services */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Services ({business.services.length})
        </h2>
        {business.services.length > 0 ? (
          <div className="space-y-2">
            {business.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.durationMinutes} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(service.priceAmount, service.currency)}
                  </p>
                  <Badge variant={service.isActive ? "secondary" : "outline"} className="text-xs">
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No services configured yet
          </div>
        )}
      </section>
    </div>
  );
}
