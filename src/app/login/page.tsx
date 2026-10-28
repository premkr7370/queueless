import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your QueueLess account to manage bookings and queue tickets.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <>
      <Header />
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
