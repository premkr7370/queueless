import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "QueueLess privacy policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              <em>
                This is a placeholder privacy policy for development. A
                production-ready privacy policy must be drafted with legal
                counsel.
              </em>
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Data We Collect
            </h2>
            <p>
              QueueLess collects only the information necessary to provide our
              service: your name, email, phone number (optional), and booking
              details. We do not sell personal data to third parties.
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              How We Use Your Data
            </h2>
            <p>
              We use your data to process bookings, send notifications, and
              improve the platform. Financial data is processed by our payment
              provider and not stored on our servers.
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Data Protection
            </h2>
            <p>
              We use encrypted connections, secure authentication, and follow
              data minimization principles. Access to customer data is
              restricted to authorized personnel only.
            </p>
          </div>
          <Button variant="outline" className="mt-8 gap-2" render={<Link href="/" />}>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
