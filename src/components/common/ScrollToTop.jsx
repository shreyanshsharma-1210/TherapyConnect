import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Always unlock scroll on route change first
    document.body.style.overflow = '';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowX = 'hidden';

    // 1. Handle regular route changes (no hash)
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    // 2. Handle hash links
    const id = hash.replace('#', '');

    const scrollToElement = () => {
      const element = document.getElementById(id);
      if (element) {
        const offset = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '72',
          10
        );
        const top = element.getBoundingClientRect().top + window.scrollY - offset - 8;
        window.scrollTo({ top, behavior: 'smooth' });
        return true;
      }
      return false;
    };

    if (!scrollToElement()) {
      const timer = setTimeout(scrollToElement, 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
