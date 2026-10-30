import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "./header";

/**
 * Async inner component that fetches the current user.
 * Wrapped in Suspense so that static pages can prerender
 * without being blocked by the cookies() call.
 */
async function AuthenticatedHeader() {
  const user = await getCurrentUser();
  return <Header user={user} />;
}

/**
 * Server component wrapper for Header.
 * Uses Suspense so that prerendering succeeds on static pages.
 * The fallback renders a guest header while the user state streams in.
 */
export function ServerHeader() {
  return (
    <Suspense fallback={<Header user={null} />}>
      <AuthenticatedHeader />
    </Suspense>
  );
}
