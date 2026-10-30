import type { Metadata } from "next";
import Link from "next/link";
import { ServerHeader, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "QueueLess terms of service.",
};

export default function TermsPage() {
  return (
    <>
      <ServerHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              <em>
                This is a placeholder terms of service for development. A
                production-ready document must be drafted with legal counsel.
              </em>
            </p>
            <h2 className="text-lg font-semibold text-foreground">Platform Usage</h2>
            <p>
              QueueLess provides a marketplace platform connecting customers with local
              service businesses. We facilitate bookings and queue management but are not
              the service provider. Each business is independently responsible for the
              quality of its services.
            </p>
            <h2 className="text-lg font-semibold text-foreground">User Accounts</h2>
            <p>
              Users must provide accurate information during registration. You are
              responsible for maintaining the security of your account credentials.
              Sharing accounts or using another person&apos;s account is prohibited.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Bookings</h2>
            <p>
              When you make a booking through QueueLess, you agree to the specific
              cancellation and refund policies set by the business. QueueLess displays
              these policies before booking confirmation.
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
