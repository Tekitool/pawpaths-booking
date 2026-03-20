// lib/logger.ts
// Structured JSON logger for production observability.
// Outputs structured JSON in production, readable format in development.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    data?: Record<string, unknown>;
    error?: {
        message: string;
        stack?: string;
    };
}

const isProd = process.env.NODE_ENV === 'production';

function formatEntry(entry: LogEntry): string {
    if (isProd) {
        return JSON.stringify(entry);
    }
    // Dev: readable format
    const prefix = `[${entry.level.toUpperCase()}]`;
    const ctx = entry.context ? ` [${entry.context}]` : '';
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    const err = entry.error ? ` | ${entry.error.message}` : '';
    return `${prefix}${ctx} ${entry.message}${data}${err}`;
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(context && { context }),
        ...(data && { data }),
    };

    const formatted = formatEntry(entry);

    switch (level) {
        case 'debug':
            if (!isProd) console.debug(formatted);
            break;
        case 'info':
            console.info(formatted);
            break;
        case 'warn':
            console.warn(formatted);
            break;
        case 'error':
            console.error(formatted);
            break;
    }
}

/**
 * Create a logger scoped to a specific context (module/action name).
 *
 * @example
 * const log = createLogger('finance-actions');
 * log.info('Document created', { docId: '123' });
 * log.error('Failed to save', { error: err.message });
 */
export function createLogger(context: string) {
    return {
        debug: (message: string, data?: Record<string, unknown>) => log('debug', message, context, data),
        info: (message: string, data?: Record<string, unknown>) => log('info', message, context, data),
        warn: (message: string, data?: Record<string, unknown>) => log('warn', message, context, data),
        error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
            const errorObj = error instanceof Error
                ? { message: error.message, stack: error.stack }
                : error
                    ? { message: String(error) }
                    : undefined;

            const entry: LogEntry = {
                level: 'error',
                message,
                timestamp: new Date().toISOString(),
                context,
                ...(errorObj && { error: errorObj }),
                ...(data && { data }),
            };

            console.error(formatEntry(entry));
        },
    };
}

export default createLogger;
