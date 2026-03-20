// sentry.server.config.ts
// Sentry server-side configuration — loaded in Node.js runtime.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring — sample 10% in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Environment tagging
    environment: process.env.NODE_ENV,

    // Only send errors when DSN is configured
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
