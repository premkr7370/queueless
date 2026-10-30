"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { cancelAppointmentAction } from "@/server/actions/booking.actions";

interface CancelBookingButtonProps {
  appointmentId: string;
}

export function CancelBookingButton({ appointmentId }: CancelBookingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    startTransition(async () => {
      const result = await cancelAppointmentAction(appointmentId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to cancel appointment");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
      onClick={handleCancel}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      Cancel
    </Button>
  );
}

