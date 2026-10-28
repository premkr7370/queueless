"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Hash, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Live Queue Preview — Demo component.
 * Shows a labelled demo queue preview on the homepage.
 * In production, this would display real, public-safe queue data
 * (no customer names, phone numbers, or private notes).
 */
export function LiveQueuePreview() {
  const [currentToken, setCurrentToken] = useState(14);
  const [waitingCount, setWaitingCount] = useState(7);

  // Simulate queue movement for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToken((prev) => prev + 1);
      setWaitingCount((prev) => Math.max(0, prev - 1 + Math.round(Math.random())));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const estimatedWait = waitingCount * 12; // ~12 min average per service

  return (
    <section className="border-t border-border/40 bg-muted/20" id="live-queue">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Live Queue Preview
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            See how QueueLess keeps you informed in real time
          </p>
          <Badge
            variant="outline"
            className="mt-3 text-xs text-muted-foreground"
          >
            Demo preview — not live data
          </Badge>
        </div>

        <div className="mx-auto mt-12 max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
            {/* Queue header */}
            <div className="border-b border-border/40 bg-primary/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Sunrise Health Clinic
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    General Consultation Queue
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Queue stats */}
            <div className="grid grid-cols-2 gap-px bg-border/40">
              <div className="flex flex-col items-center bg-card px-4 py-6">
                <Hash className="h-5 w-5 text-primary" />
                <span className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                  Q-{String(currentToken).padStart(3, "0")}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Now Serving
                </span>
              </div>
              <div className="flex flex-col items-center bg-card px-4 py-6">
                <Users className="h-5 w-5 text-primary" />
                <span className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                  {waitingCount}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  People Waiting
                </span>
              </div>
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between border-t border-border/40 px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Est. wait:{" "}
                  <span className="font-medium text-foreground">
                    ~{estimatedWait} min
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span className="text-xs">Estimate only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
