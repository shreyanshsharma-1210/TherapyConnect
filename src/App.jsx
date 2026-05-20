import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }    from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { ToastProvider }   from '@/context/ToastContext';
import ScrollToTop         from '@/components/common/ScrollToTop';
import AppRoutes           from '@/routes/index';
import { usePageTracking } from '@/hooks/usePageTracking';
import { Sentry }          from '@/lib/monitoring';
import CookieConsent      from '@/components/common/ConsentBanner';

function InnerApp() {
  usePageTracking();
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ScrollToTop />
      <AuthProvider>
        <ToastProvider>
          <BookingProvider>
            <AppRoutes />
          </BookingProvider>
        </ToastProvider>
      </AuthProvider>
      <CookieConsent />
    </>
  );
}

const App = Sentry.withErrorBoundary(
  function AppRoot() {
    return (
      <BrowserRouter>
        <InnerApp />
      </BrowserRouter>
    );
  },
  { fallback: <div style={{ padding: 32, textAlign: 'center' }}>Something went wrong. Please refresh.</div> }
);

export default App;
