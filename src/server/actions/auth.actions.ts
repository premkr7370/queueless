"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { registerSchema, loginSchema } from "@/lib/validations";
import { registerUser, loginUser, logoutUser } from "@/server/services/auth.service";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function registerAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || "CUSTOMER",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await registerUser(parsed.data);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Registration failed" };
  }
}

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const result = await loginUser(parsed.data);

    const cookieStore = await cookies();
    cookieStore.set("session_token", result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: result.session.expiresAt,
      path: "/",
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Login failed" };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await logoutUser(token);
    cookieStore.delete("session_token");
  }

  redirect("/");
}
