import { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, MessageSquareQuote, Calendar,
  CalendarClock, User, LogOut, Heart, Menu, X, ChevronRight, BarChart3, Tag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn }      from '@/lib/utils';

const NAV = [
  { to: '/admin',             icon: LayoutDashboard,    label: 'Overview',      end: true },
  { to: '/admin/bookings',    icon: Calendar,           label: 'Bookings'      },
  { to: '/admin/coupons',     icon: Tag,                label: 'Coupons'       },
  { to: '/admin/blog',        icon: BookOpen,           label: 'Blog'          },
  { to: '/admin/testimonials',icon: MessageSquareQuote, label: 'Testimonials'  },
  { to: '/admin/availability',icon: CalendarClock,      label: 'Availability'  },
  { to: '/admin/profile',     icon: User,               label: 'Profile'       },
  { to: '/admin/analytics',   icon: BarChart3,           label: 'Analytics'     },
];

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-semibold transition-all duration-200',
        isActive
          ? 'bg-teal-50 text-teal-700 shadow-level-1'
          : 'text-text-gray hover:bg-cream-50 hover:text-text-dark'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </NavLink>
  );
}

function Sidebar({ onClose }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-border-light shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-accent">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-text-dark text-sm leading-tight">TherapyConnect</p>
            <p className="text-label text-teal-600">Admin CMS</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-100 text-text-gray">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <p className="text-label text-text-gray uppercase tracking-wider px-3 mb-1 mt-2">Management</p>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Profile footer */}
      <div className="p-3 border-t border-border-light shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
            {profile?.full_name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-semibold text-text-dark truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-label text-teal-600">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-body-sm font-semibold text-text-gray hover:bg-red-50 hover:text-error transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-off-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-border-light shrink-0 sticky top-0 h-screen overflow-hidden">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-level-3 overflow-hidden"
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-border-light px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-cream-50 text-text-dark"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-teal-500 fill-teal-100" />
            <span className="font-display font-bold text-text-dark text-sm">Admin CMS</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            {children ?? <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
