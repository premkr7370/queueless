"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-8">
        Try Again
      </Button>
    </div>
  );
}
