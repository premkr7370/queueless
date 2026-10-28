import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your QueueLess account as a customer or business owner.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-10">
            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
