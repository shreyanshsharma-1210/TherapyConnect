import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar              from './Navbar';
import Footer              from './Footer';
import FloatingWhatsApp    from '@/components/common/FloatingWhatsApp';
import StickyMobileCTA     from '@/components/common/StickyMobileCTA';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

function Layout({ children }) {
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = '';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowX = 'hidden';
  }, [location.pathname]);

  const variants = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : pageVariants;

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-off-white overflow-x-hidden">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="flex-1 min-w-0"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="main"
          id="main-content"
        >
          {children ?? <Outlet />}
        </motion.main>
      </AnimatePresence>

      {!['/dashboard', '/book'].includes(location.pathname) && <Footer />}
      <FloatingWhatsApp />
      <StickyMobileCTA />
    </div>
  );
}

export default Layout;
