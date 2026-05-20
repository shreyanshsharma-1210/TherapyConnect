import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';

function AuthSpinner({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white">
      <Spinner size="lg" label={label} />
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, initializing, emailVerified } = useAuth();
  const location = useLocation();

  if (loading || initializing) return <AuthSpinner label="Verifying session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Email verification enforcement (soft warning for now, can be strict later)
  if (!emailVerified && location.pathname !== '/auth/verify-email') {
    // Allow access but could redirect to verification page for strict enforcement
    // For now, let users through with a warning in the UI
  }

  // Admins hitting /dashboard directly get redirected to /admin
  // (but /book and other routes are accessible to admins too)
  if (isAdmin && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, initializing } = useAuth();
  const location = useLocation();

  // Block render until auth is fully resolved — prevents flicker
  if (loading || initializing) return <AuthSpinner label="Verifying permissions…" />;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, initializing } = useAuth();

  if (loading || initializing) return <AuthSpinner />;

  if (isAuthenticated) {
    // Admins go to /admin, regular users go to /dashboard
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}
