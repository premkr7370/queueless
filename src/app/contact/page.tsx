import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the QueueLess team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Contact Us</h1>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Have questions, feedback, or need support? We&apos;d love to hear from
              you.
            </p>
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h2 className="font-semibold text-foreground">Email</h2>
              <p className="mt-1">support@queueless.example.com</p>
              <p className="mt-4 text-xs italic">
                This is a demo contact page. A full contact form will be
                implemented in a future phase.
              </p>
            </div>
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
