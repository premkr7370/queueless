import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for route protection and security.
 *
 * Protected route patterns:
 *  - /customer/* — requires CUSTOMER or ADMIN role
 *  - /owner/*    — requires SHOP_OWNER or ADMIN role
 *  - /admin/*    — requires ADMIN role
 *
 * Rate limiting:
 *  - /login, /register — limited to prevent brute-force
 *
 * Note: This middleware only checks for the presence of a session cookie.
 * Full role verification happens server-side in the route/action.
 */

// Simple in-memory rate limit for Edge Runtime (middleware)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  // Rate limit auth endpoints (10 requests per 15 minutes per IP)
  const rateLimitedPaths = ["/login", "/register"];
  if (rateLimitedPaths.some((path) => pathname.startsWith(path))) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") ||
               "unknown";

    if (request.method === "POST") {
      if (isRateLimited(`auth:${ip}`, 10, 15 * 60 * 1000)) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429, headers: { "Retry-After": "900" } }
        );
      }
    }
  }

  // Protect authenticated routes
  const protectedPaths = ["/customer", "/owner", "/admin"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/owner/:path*", "/admin/:path*", "/login", "/register"],
};

