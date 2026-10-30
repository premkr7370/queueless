export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ServerHeader, Footer } from "@/components/layout";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your QueueLess account to manage bookings and queue tickets.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    // Redirect authenticated users to their role-specific dashboard
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "SHOP_OWNER") redirect("/owner");
    redirect("/customer/bookings");
  }

  return (
    <>
      <ServerHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-10">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
