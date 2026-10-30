/**
 * Rate limiter unit tests.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  _resetStore,
  type RateLimitConfig,
} from "@/lib/rate-limit";

beforeEach(() => {
  _resetStore();
});

describe("checkRateLimit", () => {
  const config: RateLimitConfig = {
    maxRequests: 3,
    windowSeconds: 60,
  };

  it("allows requests within the limit", () => {
    const r1 = checkRateLimit("test-ip", config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit("test-ip", config);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit("test-ip", config);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests exceeding the limit", () => {
    checkRateLimit("test-ip", config);
    checkRateLimit("test-ip", config);
    checkRateLimit("test-ip", config);

    const r4 = checkRateLimit("test-ip", config);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetInSeconds).toBeGreaterThan(0);
  });

  it("isolates different identifiers", () => {
    checkRateLimit("ip-1", config);
    checkRateLimit("ip-1", config);
    checkRateLimit("ip-1", config);

    // ip-2 should be unaffected
    const result = checkRateLimit("ip-2", config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("returns proper resetInSeconds", () => {
    const result = checkRateLimit("test-ip", config);
    expect(result.resetInSeconds).toBeLessThanOrEqual(60);
    expect(result.resetInSeconds).toBeGreaterThan(0);
  });
});
