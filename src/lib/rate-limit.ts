/**
 * In-memory rate limiter for server-side use.
 *
 * Uses a sliding-window counter approach with automatic cleanup.
 * Suitable for single-instance deployments. For multi-instance production,
 * replace with Redis-based rate limiting.
 *
 * @module lib/rate-limit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Don't prevent process from exiting
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check and update rate limit for a given identifier.
 *
 * @param identifier - Unique key for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with remaining count and reset time
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${identifier}`;

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // Start a new window
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetInSeconds: config.windowSeconds,
    };
  }

  if (entry.count >= config.maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  entry.count++;
  const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetInSeconds,
  };
}

/**
 * Predefined rate limit configurations for common operations.
 */
export const RATE_LIMITS = {
  /** Auth endpoints: 10 attempts per 15 minutes */
  AUTH: { maxRequests: 10, windowSeconds: 900 } satisfies RateLimitConfig,

  /** Booking/queue: 20 requests per minute */
  BOOKING: { maxRequests: 20, windowSeconds: 60 } satisfies RateLimitConfig,

  /** API general: 100 requests per minute */
  API_GENERAL: { maxRequests: 100, windowSeconds: 60 } satisfies RateLimitConfig,

  /** Webhook endpoints: 50 requests per minute */
  WEBHOOK: { maxRequests: 50, windowSeconds: 60 } satisfies RateLimitConfig,
};

/**
 * Reset the rate limit store (for testing only).
 */
export function _resetStore() {
  store.clear();
}
