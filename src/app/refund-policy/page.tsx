import type { Metadata } from "next";
import Link from "next/link";
import { ServerHeader, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "QueueLess cancellation and refund policy.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <ServerHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Cancellation & Refund Policy
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              <em>
                This is a placeholder policy for development. Production
                policies must be reviewed by legal counsel.
              </em>
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Cancellation by Customer
            </h2>
            <p>
              Each business on QueueLess sets its own cancellation window. If
              you cancel within the allowed period, you may receive a full
              refund. Cancellations outside the window may incur charges as
              specified by the business.
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Cancellation by Business
            </h2>
            <p>
              If a business cancels your booking, you will receive a full refund
              of any amount paid through the platform. Refunds are processed
              within 5–7 business days.
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              No-Show Policy
            </h2>
            <p>
              If you do not arrive for your appointment or walk-in queue slot,
              the business may mark you as a no-show. No-show bookings are
              generally not eligible for refunds unless the business policy
              states otherwise.
            </p>
          </div>
          <Button variant="outline" className="mt-8 gap-2" render={<Link href="/" />}>
            <ArrowLeft className="h-4 w-4" />Back to Home
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
