// lib/rate-limit.ts
// Distributed rate limiter backed by Upstash Redis.
// Falls back to an in-process Map when Upstash env vars are absent (local dev only).
//
// SETUP: Add to .env.local (and Vercel environment variables):
//   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
//   UPSTASH_REDIS_REST_TOKEN=your-token
//
// Get these from: https://console.upstash.com → Create Database → REST API

import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
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

// ── Upstash Redis singleton (created once per warm Lambda) ─────────────────
const rawUrl = process.env.UPSTASH_REDIS_REST_URL ?? '';
const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? '';

// Validate URL format early so misconfigured env vars fail loudly at startup
// rather than producing an obscure UrlError on first request.
const upstashUrlValid = rawUrl.startsWith('https://') && !rawUrl.includes(' ') && rawUrl.length < 200;
const upstashConfigured = !!(upstashUrlValid && rawToken);

if (rawUrl && !upstashUrlValid) {
    console.error(
        '[rate-limit] UPSTASH_REDIS_REST_URL is malformed. ' +
            'Expected a URL starting with "https://", no spaces, max 200 chars. ' +
            `Received: "${rawUrl.slice(0, 80)}${rawUrl.length > 80 ? '...' : ''}"`
    );
}

const redis = upstashConfigured
    ? new Redis({ url: rawUrl, token: rawToken })
    : null;

if (process.env.NODE_ENV === 'production' && !upstashConfigured) {
    console.warn(
        '[rate-limit] WARNING: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. ' +
            'Rate limiting is ineffective across serverless instances. ' +
            'Create a free database at https://console.upstash.com and add the env vars.'
    );
}

// ── Upstash Redis implementation (fixed-window counter) ───────────────────
async function checkRedis(
    identifier: string,
    config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    const key = `rl:${identifier}`;
    const windowSec = Math.floor(config.windowMs / 1000);

    // INCR is atomic in Redis — no race condition possible
    const count = await redis!.incr(key);

    // Set the window TTL on the first request only; subsequent INCRs leave it unchanged
    if (count === 1) {
        await redis!.expire(key, windowSec);
    }

    if (count > config.maxRequests) {
        const ttl = await redis!.ttl(key);
        return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, ttl * 1000) };
    }

    return {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - count),
        retryAfterMs: 0,
    };
}

// ── In-memory fallback (local dev only) ───────────────────────────────────
const memStore = new Map<string, { count: number; resetTime: number }>();

function checkMemory(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const entry = memStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        memStore.set(identifier, { count: 1, resetTime: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, retryAfterMs: entry.resetTime - now };
    }

    entry.count++;
    return { allowed: true, remaining: config.maxRequests - entry.count, retryAfterMs: 0 };
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Check if a request is within rate limits.
 * Uses Upstash Redis when configured, in-memory Map otherwise (dev only).
 *
 * @param identifier - Unique key per route + client, e.g. `booking:${ip}`
 * @param config     - Rate limit config from RATE_LIMITS
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = RATE_LIMITS.api
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    if (redis) {
        return checkRedis(identifier, config);
    }
    return checkMemory(identifier, config);
}

/**
 * Extract the client's real IP from Vercel / proxy forwarded headers.
 */
export function getClientIP(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
