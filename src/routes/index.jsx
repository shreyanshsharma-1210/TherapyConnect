import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout       from '@/components/layout/Layout';
import AdminLayout  from '@/components/admin/AdminLayout';
import Spinner      from '@/components/ui/Spinner';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/auth/ProtectedRoute';

// Public pages
const Home               = lazy(() => import('@/pages/Home'));
const BookSession        = lazy(() => import('@/pages/BookSession'));
const BlogPost           = lazy(() => import('@/pages/BlogPost'));
const Dashboard          = lazy(() => import('@/pages/Dashboard'));
const NotFound           = lazy(() => import('@/pages/NotFound'));

// Legal pages
const PrivacyPolicy      = lazy(() => import('@/pages/legal/PrivacyPolicy'));
const TermsOfService     = lazy(() => import('@/pages/legal/TermsOfService'));
const CancellationPolicy = lazy(() => import('@/pages/legal/CancellationPolicy'));

// Admin extras
const AdminReporting     = lazy(() => import('@/pages/admin/AdminReporting'));

// Auth pages (no main layout)
const Login          = lazy(() => import('@/pages/auth/Login'));
const Signup         = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('@/pages/auth/ResetPassword'));

// Admin pages
const AdminOverview      = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminBookings      = lazy(() => import('@/pages/admin/AdminBookings'));
const AdminCoupons       = lazy(() => import('@/pages/admin/AdminCoupons'));
const AdminBlog          = lazy(() => import('@/pages/admin/AdminBlog'));
const AdminTestimonials  = lazy(() => import('@/pages/admin/AdminTestimonials'));
const AdminAvailability  = lazy(() => import('@/pages/admin/AdminAvailability'));
const AdminProfile       = lazy(() => import('@/pages/admin/AdminProfile'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white">
      <Spinner size="lg" label="Loading…" />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>

        {/* ── Public routes (with main layout) ─────────────────── */}
        <Route element={<Layout />}>
          <Route path="/"         element={<Home />}        />
          <Route path="/book"     element={<ProtectedRoute><BookSession /></ProtectedRoute>} />
          <Route path="/blog/:id"            element={<BlogPost />}           />
          <Route path="/blog"                element={<BlogPost />}           />
          <Route path="/privacy"             element={<PrivacyPolicy />}      />
          <Route path="/terms"               element={<TermsOfService />}     />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── Auth routes (no layout) ──────────────────────────── */}
        <Route
          path="/auth/login"
          element={<GuestRoute><Login /></GuestRoute>}
        />
        <Route
          path="/auth/signup"
          element={<GuestRoute><Signup /></GuestRoute>}
        />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password"  element={<ResetPassword />}  />

        {/* ── Admin routes (admin layout + role guard) ─────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index            element={<AdminOverview />}     />
          <Route path="bookings"  element={<AdminBookings />}     />
          <Route path="coupons"   element={<AdminCoupons />}      />
          <Route path="blog"      element={<AdminBlog />}         />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="availability" element={<AdminAvailability />} />
          <Route path="profile"    element={<AdminProfile />}      />
          <Route path="reporting"  element={<AdminReporting />}    />
        </Route>

      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
