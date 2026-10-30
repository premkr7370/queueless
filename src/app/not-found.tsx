import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServerHeader, Footer } from "@/components/layout";

export default function NotFound() {
  return (
    <>
      <ServerHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <span className="text-7xl font-bold text-primary/20">404</span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button className="mt-8" render={<Link href="/" />}>
          Back to Home
        </Button>
      </main>
      <Footer />
    </>
  );
}
