// lib/env.js
// Runtime environment variable validation.
// Imported by next.config.mjs and instrumentation hooks to fail fast on missing vars.

const requiredServer = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
];

const requiredPublic = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optionalServer = [
    'OPENAI_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_BUCKET_NAME',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_COOKIE_DOMAIN',
    'NEXT_PUBLIC_SENTRY_DSN',
    'SENTRY_AUTH_TOKEN',
];

/**
 * Validate required environment variables exist.
 * Call at build time or server startup.
 * Returns { valid, missing[] }.
 */
export function validateEnv() {
    const missing = [];

    for (const key of requiredServer) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        console.error(
            `\n❌ Missing required environment variables:\n${missing.map(k => `   - ${k}`).join('\n')}\n` +
            `\nCopy .env.example to .env.local and fill in the values.\n`
        );
        return { valid: false, missing };
    }

    // Warn about optional but recommended vars
    const warnings = [];
    for (const key of optionalServer) {
        if (!process.env[key]) {
            warnings.push(key);
        }
    }

    if (warnings.length > 0) {
        console.warn(
            `⚠️  Optional environment variables not set: ${warnings.join(', ')}`
        );
    }

    return { valid: true, missing: [] };
}

/**
 * Get a required env var or throw.
 */
export function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
