import posthog from 'posthog-js';

const POSTHOG_KEY  = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (!POSTHOG_KEY || initialized) return;
  posthog.init(POSTHOG_KEY, {
    api_host:          POSTHOG_HOST,
    capture_pageview:  false,
    capture_pageleave: true,
    autocapture:       false,
    session_recording: {
      maskAllInputs:         true,
      maskInputOptions:      { password: true, email: true, tel: true },
      blockClass:            'ph-no-capture',
      maskTextClass:         'ph-mask',
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
  initialized = true;
}

export function identifyUser(userId, traits = {}) {
  if (!initialized) return;
  posthog.identify(userId, traits);
}

export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

export function trackPage(path, properties = {}) {
  if (!initialized) return;
  posthog.capture('$pageview', { $current_url: path, ...properties });
}

// Core event tracker
export function track(event, properties = {}) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

// ----- Booking Funnel -----
export const analytics = {
  // Page
  pageView: (path)                        => trackPage(path),

  // Auth
  signupStarted:  ()                      => track('signup_started'),
  signupComplete: (method = 'email')      => track('signup_complete',  { method }),
  loginComplete:  (method = 'email')      => track('login_complete',   { method }),
  logout:         ()                      => track('logout'),

  // Booking funnel
  bookingStarted:   (service)             => track('booking_started',     { service }),
  bookingStepOne:   (service, mode)       => track('booking_step_1',      { service, mode }),
  bookingStepTwo:   (date, time)          => track('booking_step_2',      { date, time }),
  bookingStepThree: ()                    => track('booking_step_3_personal'),
  bookingSubmitted: (service, amount)     => track('booking_submitted',   { service, amount }),
  bookingConfirmed: (bookingId, amount)   => track('booking_confirmed',   { booking_id: bookingId, amount }),
  bookingCancelled: (bookingId, reason)   => track('booking_cancelled',   { booking_id: bookingId, reason }),

  // Payment funnel
  paymentInitiated: (amount)             => track('payment_initiated',   { amount }),
  paymentSuccess:   (amount, method)     => track('payment_success',     { amount, method }),
  paymentFailed:    (amount, reason)     => track('payment_failed',      { amount, reason }),
  paymentRetried:   ()                   => track('payment_retried'),
  receiptDownloaded:()                   => track('receipt_downloaded'),

  // CTA / engagement
  ctaClicked:       (label, location)    => track('cta_clicked',         { label, location }),
  blogRead:         (slug, title)        => track('blog_read',           { slug, title }),
  blogTimeOnPage:   (slug, seconds)      => track('blog_time_on_page',   { slug, seconds }),
  testimonialViewed:()                   => track('testimonial_viewed'),
  serviceViewed:    (service)            => track('service_viewed',      { service }),
  faqExpanded:      (question)           => track('faq_expanded',        { question }),

  // Dashboard
  dashboardTab:     (tab)                => track('dashboard_tab',       { tab }),
  notifRead:        ()                   => track('notification_read'),

  // Admin
  adminBookingUpdated: (status)          => track('admin_booking_updated', { status }),
  adminBlogPublished:  ()                => track('admin_blog_published'),
};
