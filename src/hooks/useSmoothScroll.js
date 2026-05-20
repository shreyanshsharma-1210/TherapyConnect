import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Returns a handler that smoothly scrolls to a hash section.
 * If we're not on the home page, it navigates there first then scrolls.
 */
export function useSmoothScroll() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = useCallback((hash) => {
    const id = hash.replace('#', '');
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scroll, 400);
    } else {
      scroll();
    }
  }, [navigate, location.pathname]);

  return scrollTo;
}
