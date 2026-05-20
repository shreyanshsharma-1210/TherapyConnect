import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV        = import.meta.env.VITE_APP_ENV || (import.meta.env.DEV ? 'development' : 'production');
const RELEASE    = import.meta.env.VITE_APP_VERSION || '1.0.0';

export function initMonitoring() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn:         SENTRY_DSN,
    environment: ENV,
    release:     `therapy-connect@${RELEASE}`,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText:   true,
        blockAllMedia: false,
        maskAllInputs: true,
      }),
    ],
    tracesSampleRate:   ENV === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Strip PII from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs.values = event.breadcrumbs.values?.map((b) => {
          if (b.category === 'xhr' || b.category === 'fetch') {
            if (b.data?.url?.includes('/auth/')) b.data.url = '[auth-endpoint]';
            if (b.data?.url?.includes('razorpay')) b.data.url = '[payment-endpoint]';
          }
          return b;
        });
      }
      return event;
    },
  });
}

export function captureError(error, context = {}) {
  if (!SENTRY_DSN) {
    console.error('[Error]', error, context);
    return;
  }
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
}

export function setSentryUser(userId, email) {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser() {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export { Sentry };
