import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, LayoutDashboard, LogOut, ShieldCheck, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { drawerSlide, overlayFade } from '@/lib/animations';
import Button from '@/components/ui/Button';
import Container from '@/components/common/Container';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'Home',         to: '/'               },
  { label: 'About',        to: '/#about'         },
  { label: 'Services',     to: '/#services'      },
  { label: 'Testimonials', to: '/#testimonials'  },
  { label: 'Pricing',      to: '/#pricing'       },
  { label: 'Blog',         to: '/#blog'          },
  { label: 'Contact',      to: '/#contact'       },
];

function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { isAuthenticated, isAdmin, profile, signOut, initializing, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, to) => {
    if (to === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMenuOpen(false);
      return;
    }

    // If the link is a hash link on the same page
    if (to.startsWith('/#')) {
      const hash = to.split('#')[1];
      const targetElement = document.getElementById(hash);
      
      if (location.pathname === '/' && targetElement) {
        e.preventDefault();
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetElement.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL hash without jumping
        window.history.pushState(null, '', `/#${hash}`);
        setMenuOpen(false);
      }
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-level-1'
            : 'bg-white'
        )}
      >
        <Container>
          <nav
            className="flex items-center justify-between h-[var(--nav-height)]"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Link to="/" onClick={(e) => handleLinkClick(e, '/')} className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent text-white shadow-level-1 group-hover:bg-accent-dark transition-colors duration-200">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-text-dark tracking-tight">
                Charushri<span className="text-accent-dark">Suhaney</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleLinkClick(e, link.to)}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-btn text-body-sm font-semibold transition-colors duration-200',
                      isActive
                        ? 'text-accent-dark'
                        : 'text-text-dark hover:text-accent-dark hover:bg-accent/5'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {(loading || initializing) ? (
                <div className="w-20 h-8 rounded-btn bg-cream-100 animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-body-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors duration-200">
                      <ShieldCheck className="w-4 h-4" /> Admin Panel
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-body-sm font-semibold text-text-dark hover:text-accent-dark hover:bg-accent/5 transition-colors duration-200">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-body-sm font-semibold text-text-gray hover:text-error hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    {profile?.full_name?.split(' ')[0] || 'Sign Out'}
                  </button>
                </>
              ) : (
                <Link to="/auth/login" className="flex items-center gap-1.5 px-3 py-2 rounded-btn text-body-sm font-semibold text-text-dark hover:text-accent-dark hover:bg-accent/5 transition-colors duration-200">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
              <Button className="shadow-level-1" size="sm" as={Link} to="/book">
                Begin Healing
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-text-dark hover:bg-off-white transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50"
              variants={overlayFade}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              id="mobile-drawer"
              className="fixed top-0 right-0 z-[60] h-full w-72 max-w-[90vw] bg-white shadow-level-3 flex flex-col overflow-hidden"
              variants={drawerSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={(e) => handleLinkClick(e, '/')}
                >
                  <Heart className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span className="font-display font-bold text-lg text-text-dark">
                    Charushri<span className="text-accent-dark">Suhaney</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full text-text-gray hover:bg-off-white hover:text-text-dark transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <ul className="flex flex-col gap-1" role="list">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        onClick={(e) => {
                          handleLinkClick(e, link.to);
                          setMenuOpen(false);
                        }}
                        className={({ isActive }) =>
                          cn(
                            'block px-4 py-3 rounded-btn text-body font-medium transition-colors duration-200',
                            isActive
                              ? 'text-accent-dark bg-accent/5'
                              : 'text-text-dark hover:text-accent-dark hover:bg-accent/5'
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Drawer CTA */}
              <div className="px-6 py-6 border-t border-border-light flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200 text-body font-semibold text-teal-700">
                        <ShieldCheck className="w-5 h-5" /> Admin Panel
                      </Link>
                    ) : (
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-light text-body font-semibold text-text-dark hover:bg-off-white transition-colors">
                        <LayoutDashboard className="w-5 h-5" /> My Dashboard
                      </Link>
                    )}
                    <button onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-body font-semibold text-error bg-red-50">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/auth/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-light text-body font-semibold text-text-dark hover:bg-off-white transition-colors">
                    <LogIn className="w-5 h-5" /> Sign In
                  </Link>
                )}
                <Button fullWidth className="shadow-level-1" as={Link} to="/book" onClick={() => setMenuOpen(false)}>
                  Begin Your Healing
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
