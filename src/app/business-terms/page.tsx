import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Terms",
  description: "Terms and conditions for businesses listing on QueueLess.",
};

export default function BusinessTermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Business Terms</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              <em>
                This is a placeholder business terms document for development.
              </em>
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Commission Model
            </h2>
            <p>
              QueueLess charges a configurable platform commission on completed
              bookings. The default commission rate is 10% of the eligible
              service amount. The applicable rate is captured as an immutable
              snapshot at the time of booking and will not change retroactively.
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Business Verification
            </h2>
            <p>
              All businesses undergo a verification process. Verification
              states include PENDING, APPROVED, and REJECTED. Only approved
              businesses receive a verified badge on their listing. Pending
              businesses may still accept bookings but will not display the
              verified badge.
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Payouts
            </h2>
            <p>
              Net earnings (gross booking amount minus platform commission) are
              settled to the business owner&apos;s registered bank account on a
              configurable payout schedule. Gateway fees and applicable taxes
              are deducted separately.
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
