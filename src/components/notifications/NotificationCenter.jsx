import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, CreditCard, Calendar, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

const TYPE_CONFIG = {
  payment_success: { icon: CreditCard, color: 'text-green-600',  bg: 'bg-green-50' },
  booking_confirmed:{ icon: Calendar,   color: 'text-teal-600',   bg: 'bg-teal-50'  },
  booking_cancelled:{ icon: AlertCircle,color: 'text-red-500',    bg: 'bg-red-50'   },
  reminder:        { icon: Bell,        color: 'text-amber-600',  bg: 'bg-amber-50' },
  default:         { icon: Info,        color: 'text-text-gray',  bg: 'bg-gray-50'  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifItem({ notif, onRead }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex gap-3 px-4 py-3 hover:bg-cream-50 transition-colors cursor-pointer group',
        !notif.is_read && 'bg-teal-50/40'
      )}
      onClick={() => !notif.is_read && onRead(notif.id)}
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
        <Icon className={cn('w-4 h-4', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-body-sm text-text-dark leading-snug', !notif.is_read && 'font-semibold')}>
          {notif.title}
        </p>
        <p className="text-label text-text-gray mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-label text-text-gray mt-1 opacity-70">{timeAgo(notif.created_at)}</p>
      </div>
      {!notif.is_read && (
        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
      )}
    </motion.div>
  );
}

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-text-gray" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </div>
  );
}

export default function NotificationCenter({ isOpen, onClose }) {
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();
  const panelRef = useRef();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-level-3 border border-border-light z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              <p className="font-body font-bold text-text-dark text-sm">Notifications</p>
              {unreadCount > 0 && (
                <span className="bg-teal-100 text-teal-700 text-label font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-label text-teal-600 hover:text-teal-700 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={onClose} className="p-1.5 hover:bg-cream-50 rounded-lg transition-colors">
                <X className="w-4 h-4 text-text-gray" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-0">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-cream-50 animate-pulse shrink-0" />
                    <div className="flex-1 flex flex-col gap-2 pt-1">
                      <div className="h-3 bg-cream-50 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-cream-50 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="w-8 h-8 text-border-light" />
                <p className="text-body-sm text-text-gray">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {notifications.map((n) => (
                  <NotifItem key={n.id} notif={n} onRead={markRead} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
