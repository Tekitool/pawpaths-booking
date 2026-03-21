'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

/**
 * global-error.tsx — catches errors that escape the root layout and all nested
 * error.tsx boundaries, including errors thrown inside layout.tsx itself.
 * Must render its own <html> / <body> because the root layout is unavailable.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
        console.error('[GlobalError]', error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    padding: 0,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    backgroundColor: '#F9FAFB',
                }}
            >
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ maxWidth: '480px', width: '100%' }}>
                        <div style={{ fontSize: '52px', marginBottom: '16px', lineHeight: 1 }}>
                            🐾
                        </div>

                        <h1
                            style={{
                                margin: '0 0 8px',
                                fontSize: '22px',
                                fontWeight: 700,
                                color: '#4D2A00',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            Something went wrong
                        </h1>

                        <p
                            style={{
                                margin: '0 0 28px',
                                fontSize: '14px',
                                color: '#6B7280',
                                lineHeight: 1.7,
                            }}
                        >
                            An unexpected error occurred. Your data is safe — please try
                            refreshing the page or come back in a moment.
                        </p>

                        {error.digest && (
                            <p
                                style={{
                                    margin: '0 0 24px',
                                    fontSize: '11px',
                                    color: '#9CA3AF',
                                    fontFamily: 'monospace',
                                    letterSpacing: '0.3px',
                                }}
                            >
                                Reference: {error.digest}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={reset}
                                style={{
                                    background: '#FF6400',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '12px 28px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                    minWidth: '44px',
                                }}
                            >
                                Try again
                            </button>

                            <Link
                                href="/"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: '#F3F4F6',
                                    color: '#374151',
                                    border: '1px solid #E5E7EB',
                                    padding: '12px 28px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    minHeight: '44px',
                                }}
                            >
                                Go home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
