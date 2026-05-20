import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';

function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Hide on /book and /dashboard
  const hide = location.pathname === '/book' || location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (hide) { setVisible(false); return; }
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hide]);

  return (
    <AnimatePresence>
      {visible && !hide && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-border-light px-4 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
        >
          <Link
            to="/book"
            className="flex items-center justify-center gap-2 w-full btn-primary rounded-xl min-h-[48px]"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            Book a Session
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyMobileCTA;
