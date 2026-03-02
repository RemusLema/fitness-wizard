// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && dsn !== "REPLACE_ME") {
    Sentry.init({
        dsn,
        tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
        environment: process.env.NODE_ENV,
    });
}
