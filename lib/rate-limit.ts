// lib/rate-limit.ts
// In-memory rate limiter with configurable windows per route type.

const store = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 60s
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of store.entries()) {
            if (now > value.resetTime) {
                store.delete(key);
            }
        }
    }, 60_000);
}

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

/** Preset limits for different route types */
export const RATE_LIMITS = {
    /** Public form submissions (booking, contact) */
    submission: { windowMs: 60 * 60 * 1000, maxRequests: 10 } as RateLimitConfig,
    /** AI-powered endpoints (breed scanner, crate audit) */
    ai: { windowMs: 60 * 60 * 1000, maxRequests: 15 } as RateLimitConfig,
    /** File uploads */
    upload: { windowMs: 60 * 60 * 1000, maxRequests: 30 } as RateLimitConfig,
    /** General API */
    api: { windowMs: 15 * 60 * 1000, maxRequests: 100 } as RateLimitConfig,
};

/**
 * Check if a request is within rate limits.
 * @param identifier - Unique key (usually IP + route prefix)
 * @param config - Rate limit configuration
 * @returns { allowed, remaining, retryAfterMs }
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = RATE_LIMITS.api
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetTime) {
        store.set(identifier, { count: 1, resetTime: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, retryAfterMs: entry.resetTime - now };
    }

    entry.count++;
    return { allowed: true, remaining: config.maxRequests - entry.count, retryAfterMs: 0 };
}

/**
 * Helper to extract client IP from request headers.
 */
export function getClientIP(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
