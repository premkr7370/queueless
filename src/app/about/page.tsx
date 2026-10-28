import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "About QueueLess",
  description: "Learn about QueueLess — the local services marketplace with virtual queue management.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Info className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              About QueueLess
            </h1>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                QueueLess is a commission-based local services marketplace that
                connects customers with appointment-based businesses. Our
                platform helps people discover services, book appointments, and
                track their queue positions in real time.
              </p>
              <p>
                We serve clinics, dental offices, salons, spas, diagnostic
                centers, repair services, and other local businesses that operate
                on appointments or walk-in queues.
              </p>
              <p>
                For businesses, QueueLess provides tools to manage listings,
                services, staff, queues, and bookings — with transparent
                commission-based pricing on completed bookings.
              </p>
            </div>
            <Button variant="outline" className="mt-8 gap-2" render={<Link href="/" />}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
