import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import posthog from 'posthog-js';

const CONSENT_KEY = 'tc_cookie_consent';

export default function CookieConsent() {
  const [visible,      setVisible]      = useState(false);
  const [showDetails,  setShowDetails]  = useState(false);
  const [analytics,    setAnalytics]    = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Show after 2s
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
    const prefs = JSON.parse(stored);
    if (!prefs.analytics) posthog.opt_out_capturing?.();
  }, []);

  const accept = (analyticsEnabled = true) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: analyticsEnabled, essential: true, ts: Date.now() }));
    if (!analyticsEnabled) posthog.opt_out_capturing?.();
    else posthog.opt_in_capturing?.();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 100,  opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[80] bg-white rounded-2xl shadow-level-3 border border-border-light overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-teal-300" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-teal-600 shrink-0" />
                <p className="font-body font-bold text-text-dark">Cookie Preferences</p>
              </div>
              <button onClick={() => setVisible(false)} className="p-1 hover:bg-cream-50 rounded-lg">
                <X className="w-4 h-4 text-text-gray" />
              </button>
            </div>

            <p className="text-body-sm text-text-gray mb-4">
              We use essential cookies to run the platform and optional analytics cookies to improve your experience.{' '}
              <Link to="/privacy" className="text-teal-600 hover:underline" onClick={() => setVisible(false)}>Privacy Policy</Link>
            </p>

            {showDetails && (
              <div className="mb-4 flex flex-col gap-2 bg-off-white rounded-xl p-3 text-body-sm">
                <label className="flex items-center justify-between">
                  <span className="text-text-dark font-semibold">Essential Cookies</span>
                  <span className="text-label text-text-gray">Always on</span>
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <span className="text-text-dark font-semibold">Analytics Cookies</span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-4 h-4 accent-teal-600"
                  />
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => accept(false)}
                className="flex-1 py-2.5 border border-border-light text-text-dark text-body-sm font-semibold rounded-xl hover:border-teal-400 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2.5 border border-border-light rounded-xl hover:border-teal-400 transition-colors"
                title="Customize"
              >
                <Settings className="w-4 h-4 text-text-gray" />
              </button>
              <button
                onClick={() => accept(analytics)}
                className="flex-[2] py-2.5 bg-teal-600 text-white text-body-sm font-bold rounded-xl hover:bg-teal-700 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
