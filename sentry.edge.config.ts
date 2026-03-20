// sentry.edge.config.ts
// Sentry edge runtime configuration — loaded in middleware and edge routes.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Lower sample rate for edge (high volume)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

    // Environment tagging
    environment: process.env.NODE_ENV,

    // Only send errors when DSN is configured
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
