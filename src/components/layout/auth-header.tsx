import { getCurrentUser } from "@/lib/auth";
import { Header as HeaderClient } from "./header";

/**
 * Server component wrapper for Header.
 * Fetches current user and passes it to the client component.
 */
export async function AuthHeader() {
  const user = await getCurrentUser();
  return <HeaderClient user={user} />;
}
