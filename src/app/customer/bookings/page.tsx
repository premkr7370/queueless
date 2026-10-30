import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCustomerAppointments } from "@/server/services/booking.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/commission";
import { Calendar, MapPin, Clock, Search } from "lucide-react";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your appointment bookings on QueueLess.",
};

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-success/10 text-success border-success/20",
  COMPLETED: "bg-muted text-muted-foreground border-border",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  NO_SHOW: "bg-warning/10 text-warning border-warning/20",
};

export default async function BookingsPage() {
  const user = await requireUser();

  let appointments: Awaited<ReturnType<typeof getCustomerAppointments>> = [];
  try {
    appointments = await getCustomerAppointments(user.id);
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your appointment bookings
          </p>
        </div>
        <Button size="sm" render={<Link href="/explore" />} className="gap-2">
          <Search className="h-4 w-4" />
          Book New
        </Button>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="rounded-xl border bg-card p-4 sm:p-5 transition-colors hover:bg-accent/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{appt.business.name}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${STATUS_STYLES[appt.status] || ""}`}
                    >
                      {appt.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary/70 mb-2">{appt.service.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(appt.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appt.startTime} – {appt.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {appt.business.address}, {appt.business.city}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">
                    {formatCurrency(appt.service.priceAmount, appt.service.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {appt.service.durationMinutes} min
                  </p>
                  {appt.status === "CONFIRMED" && (
                    <CancelBookingButton appointmentId={appt.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No bookings yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Explore businesses near you and book your first appointment.
          </p>
          <Button className="mt-6" render={<Link href="/explore" />}>
            Explore Services
          </Button>
        </div>
      )}
    </div>
  );
}
