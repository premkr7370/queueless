"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { getAvailableSlotsAction, createAppointmentAction } from "@/server/actions/booking.actions";

interface BookingDialogProps {
  businessId: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePriceFormatted: string;
}

type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

export function BookingDialog({
  businessId,
  serviceId,
  serviceName,
  serviceDuration,
  servicePriceFormatted,
}: BookingDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isFetchingSlots, startFetchTransition] = useTransition();
  const [isBooking, startBookTransition] = useTransition();

  function handleOpen() {
    setIsOpen(true);
    setDate("");
    setSlots([]);
    setSelectedSlot(null);
    setNotes("");
    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleDateChange(newDate: string) {
    setDate(newDate);
    setSelectedSlot(null);
    setError(null);

    if (!newDate) {
      setSlots([]);
      return;
    }

    // Validate not in the past
    const selected = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      setError("Cannot book appointments in the past");
      setSlots([]);
      return;
    }

    startFetchTransition(async () => {
      const result = await getAvailableSlotsAction(businessId, serviceId, newDate);
      if (result.success) {
        setSlots(result.data as Slot[]);
        if ((result.data as Slot[]).length === 0) {
          setError("No available slots on this date. The business may be closed.");
        }
      } else {
        setError(result.error || "Failed to fetch slots");
        setSlots([]);
      }
    });
  }

  function handleBook() {
    if (!selectedSlot || !date) return;
    setError(null);

    startBookTransition(async () => {
      const formData = new FormData();
      formData.set("businessId", businessId);
      formData.set("serviceId", serviceId);
      formData.set("date", date);
      formData.set("startTime", selectedSlot);
      if (notes) formData.set("notes", notes);

      const result = await createAppointmentAction(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || "Booking failed");
      }
    });
  }

  // Get tomorrow's date as minimum selectable
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const availableSlots = slots.filter((s) => s.available);

  if (!isOpen) {
    return (
      <Button size="sm" className="mt-2 h-8 text-xs" onClick={handleOpen}>
        Book
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Dialog */}
        <div
          className="relative w-full max-w-md rounded-2xl border bg-card shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold text-lg">Book Appointment</h2>
              <p className="text-sm text-muted-foreground">
                {serviceName} · {serviceDuration} min · {servicePriceFormatted}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {success ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle className="h-12 w-12 text-success mb-3" />
                <h3 className="font-semibold text-lg">Booking Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your appointment has been booked for {date} at {selectedSlot}.
                </p>
              </div>
            ) : (
              <>
                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Select Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    min={minDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Loading */}
                {isFetchingSlots && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading slots…</span>
                  </div>
                )}

                {/* Time Slots */}
                {!isFetchingSlots && slots.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Select Time ({availableSlots.length} available)
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => {
                            setSelectedSlot(slot.startTime);
                            setError(null);
                          }}
                          className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                            !slot.available
                              ? "border-border bg-muted text-muted-foreground/50 cursor-not-allowed line-through"
                              : selectedSlot === slot.startTime
                                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                                : "border-border hover:border-primary/40 hover:bg-accent/50"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedSlot && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Notes <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests…"
                      maxLength={500}
                      rows={2}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                )}

                {/* Confirm Button */}
                {selectedSlot && (
                  <Button
                    className="w-full h-11"
                    onClick={handleBook}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking…
                      </>
                    ) : (
                      `Confirm Booking for ${selectedSlot}`
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

