// instrumentation.js
// Next.js instrumentation hook — runs once on server startup.

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Validate environment variables
        const { validateEnv } = await import('./lib/env.js');
        const result = validateEnv();
        if (!result.valid) {
            console.error('Server startup: environment validation failed.');
        }

        // Initialize Sentry for Node.js server runtime
        await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        // Initialize Sentry for edge runtime (middleware)
        await import('./sentry.edge.config');
    }
}

export const onRequestError = async (err, request, context) => {
    // Forward server-side request errors to Sentry
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureRequestError(err, request, context);
};
