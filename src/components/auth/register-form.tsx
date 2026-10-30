"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { registerAction, type ActionResult } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  AlertCircle,
  Store,
  ShoppingBag,
} from "lucide-react";

const initialState: ActionResult = { success: false };

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [role, setRole] = useState<"CUSTOMER" | "SHOP_OWNER">("CUSTOMER");
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state.success, state.redirectTo, router]);

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <UserPlus className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join QueueLess to book appointments and skip the wait
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("CUSTOMER")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
            role === "CUSTOMER"
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-border text-muted-foreground hover:border-primary/30 hover:bg-accent/50"
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("SHOP_OWNER")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
            role === "SHOP_OWNER"
              ? "border-primary bg-primary/5 text-primary shadow-sm"
              : "border-border text-muted-foreground hover:border-primary/30 hover:bg-accent/50"
          }`}
        >
          <Store className="h-5 w-5" />
          Business Owner
        </button>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        {state.error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            Account created! Redirecting…
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="register-name" className="text-sm font-medium">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              autoComplete="name"
              className="pl-10 h-11"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="pl-10 h-11"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-phone" className="text-sm font-medium">
            Phone{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-phone"
              name="phone"
              type="tel"
              placeholder="+919876543210"
              autoComplete="tel"
              className="pl-10 h-11"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className="pl-10 h-11"
              disabled={isPending}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            `Create ${role === "SHOP_OWNER" ? "Business" : "Customer"} Account`
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>

      {role === "SHOP_OWNER" && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          By creating a business account, you agree to the platform&apos;s{" "}
          <Link href="/business-terms" className="underline hover:text-foreground">
            commission terms
          </Link>
          .
        </p>
      )}
    </div>
  );
}
