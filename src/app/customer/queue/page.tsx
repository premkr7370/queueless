import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCustomerTickets } from "@/server/services/queue.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Search, Hash } from "lucide-react";

export const metadata: Metadata = {
  title: "My Queue",
  description: "View your active queue tickets on QueueLess.",
};

const STATUS_STYLES: Record<string, string> = {
  WAITING: "bg-warning/10 text-warning border-warning/20",
  CALLED: "bg-primary/10 text-primary border-primary/20",
  SERVING: "bg-success/10 text-success border-success/20",
};

export default async function QueuePage() {
  const user = await requireUser();

  let tickets: Awaited<ReturnType<typeof getCustomerTickets>> = [];
  try {
    tickets = await getCustomerTickets(user.id);
  } catch {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">My Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your active walk-in queue tickets
          </p>
        </div>
        <Button size="sm" variant="outline" render={<Link href="/explore" />} className="gap-2">
          <Search className="h-4 w-4" />
          Find Business
        </Button>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{ticket.business.name}</h3>
                  <p className="text-sm text-primary/70">{ticket.service.name}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${STATUS_STYLES[ticket.status] || ""}`}
                >
                  {ticket.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Token</p>
                    <p className="font-bold text-lg">#{ticket.tokenNumber}</p>
                  </div>
                </div>

                {ticket.estimatedWaitMinutes != null && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                      <Clock className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Wait</p>
                      <p className="font-semibold">~{ticket.estimatedWaitMinutes} min</p>
                    </div>
                  </div>
                )}
              </div>

              {ticket.status === "CALLED" && (
                <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm text-primary font-medium animate-pulse">
                  🔔 You&apos;ve been called! Please proceed to the counter.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No active queue tickets</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Visit a business and join their walk-in queue to get a virtual token.
          </p>
          <Button className="mt-6" render={<Link href="/explore" />}>
            Find a Business
          </Button>
        </div>
      )}
    </div>
  );
}
