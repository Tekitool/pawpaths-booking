// sentry.client.config.ts
// Sentry client-side configuration — loaded in the browser.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring — sample 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session replay — capture 1% of sessions, 100% on error
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
        }),
        Sentry.browserTracingIntegration(),
    ],

    // Filter out noisy errors
    ignoreErrors: [
        // Browser extensions
        'ResizeObserver loop',
        'ResizeObserver loop completed with undelivered notifications',
        // Network errors users trigger by navigating away
        'AbortError',
        'Load failed',
        'Failed to fetch',
        // Hydration mismatches (often from browser extensions injecting content)
        'Minified React error #418',
        'Minified React error #423',
    ],

    // Environment tagging
    environment: process.env.NODE_ENV,

    // Only send errors when DSN is configured
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
