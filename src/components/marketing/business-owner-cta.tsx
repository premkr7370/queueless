import Link from "next/link";
import {
  Store,
  Settings,
  Calendar,
  Bell,
  BarChart3,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const OWNER_BENEFITS = [
  { icon: Store, label: "Online business listing" },
  { icon: Settings, label: "Service and price management" },
  { icon: Calendar, label: "Appointment and walk-in queue management" },
  { icon: Bell, label: "Customer notifications" },
  { icon: BarChart3, label: "Booking analytics" },
  { icon: Receipt, label: "Earnings and commission reports" },
] as const;

export function BusinessOwnerCTA() {
  return (
    <section
      className="border-t border-border/40 bg-muted/20"
      id="for-business"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 shadow-2xl sm:p-12 lg:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Bring your business online.
              <br />
              Serve customers smarter.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80">
              Join QueueLess to manage your bookings, reduce wait times, and
              grow your customer base. A configurable platform commission
              (default 10%) applies to completed bookings.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {OWNER_BENEFITS.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left backdrop-blur-sm"
                >
                  <benefit.icon className="h-5 w-5 shrink-0 text-primary-foreground/80" />
                  <span className="text-sm font-medium text-primary-foreground">
                    {benefit.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 text-primary"
                render={<Link href="/register?role=owner" />}
                id="cta-list-business"
              >
                Start Listing Your Business
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                href="/#faq"
                className="text-sm font-medium text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline"
              >
                Learn about pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
