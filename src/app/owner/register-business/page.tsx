"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createBusinessAction } from "@/server/actions/business.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type ActionResult = { success: boolean; error?: string; data?: unknown };
const initialState: ActionResult = { success: false };

function wrappedAction(_prev: ActionResult, formData: FormData) {
  return createBusinessAction(formData);
}

export default function RegisterBusinessPage() {
  const [state, formAction, isPending] = useActionState(wrappedAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.data) {
      const data = state.data as { slug: string };
      router.push(`/business/${data.slug}`);
    }
  }, [state.success, state.data, router]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Register Business</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add your business to QueueLess and start receiving bookings
        </p>
      </div>

      <form action={formAction} className="max-w-2xl space-y-6">
        {state.error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Business registered! Redirecting…
          </div>
        )}

        {/* Business Info */}
        <fieldset className="space-y-4 rounded-xl border p-5">
          <legend className="px-2 text-sm font-semibold flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Business Details
          </legend>

          <div className="space-y-2">
            <label htmlFor="biz-name" className="text-sm font-medium">Business Name *</label>
            <Input id="biz-name" name="name" required placeholder="e.g. Sunrise Health Clinic" className="h-11" />
          </div>

          <div className="space-y-2">
            <label htmlFor="biz-desc" className="text-sm font-medium">Description</label>
            <textarea
              id="biz-desc"
              name="description"
              placeholder="Tell customers about your business…"
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="biz-category" className="text-sm font-medium">Category *</label>
            <select
              id="biz-category"
              name="categoryId"
              required
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Note: Category IDs come from the database. This form uses slugs as placeholders.
            </p>
          </div>
        </fieldset>

        {/* Location */}
        <fieldset className="space-y-4 rounded-xl border p-5">
          <legend className="px-2 text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </legend>

          <div className="space-y-2">
            <label htmlFor="biz-address" className="text-sm font-medium">Address *</label>
            <Input id="biz-address" name="address" required placeholder="Street address" className="h-11" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="biz-city" className="text-sm font-medium">City *</label>
              <Input id="biz-city" name="city" required placeholder="e.g. Bangalore" className="h-11" />
            </div>
            <div className="space-y-2">
              <label htmlFor="biz-state" className="text-sm font-medium">State *</label>
              <Input id="biz-state" name="state" required placeholder="e.g. Karnataka" className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="biz-pincode" className="text-sm font-medium">Pincode *</label>
            <Input id="biz-pincode" name="pincode" required placeholder="560001" pattern="^\d{5,6}$" className="h-11 max-w-[200px]" />
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset className="space-y-4 rounded-xl border p-5">
          <legend className="px-2 text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contact Info
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="biz-phone" className="text-sm font-medium">Phone</label>
              <Input id="biz-phone" name="phone" type="tel" placeholder="+919876543210" className="h-11" />
            </div>
            <div className="space-y-2">
              <label htmlFor="biz-email" className="text-sm font-medium">Email</label>
              <Input id="biz-email" name="email" type="email" placeholder="business@example.com" className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="biz-website" className="text-sm font-medium">Website</label>
            <Input id="biz-website" name="website" type="url" placeholder="https://example.com" className="h-11" />
          </div>
        </fieldset>

        <input type="hidden" name="timezone" value="Asia/Kolkata" />

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="h-11 px-8" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering…
              </>
            ) : (
              "Register Business"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Your business will be reviewed by our team before appearing publicly.
          Default platform commission is 10%.
        </p>
      </form>
    </div>
  );
}
