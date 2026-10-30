/**
 * Health check API endpoint.
 *
 * Returns 200 with system status for load balancers,
 * container orchestrators, and monitoring tools.
 *
 * GET /api/health
 */

import { NextResponse } from "next/server";

// Note: route segment configs (dynamic, runtime) removed for cacheComponents compatibility.
// Cache-Control headers prevent caching instead.

export async function GET() {
  const startTime = Date.now();

  // Basic health info
  const health: Record<string, unknown> = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
  };

  // Check database connectivity (optional, non-blocking)
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch {
    health.database = "unavailable";
  }

  health.responseTimeMs = Date.now() - startTime;

  const isHealthy = health.status === "healthy";

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
