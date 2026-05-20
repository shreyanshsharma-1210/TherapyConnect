import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Video, MapPin, PhoneCall,
  CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Download, Heart, ArrowLeft, LayoutDashboard,
  History, User, ChevronRight, X, RotateCcw,
  CreditCard, Bell, IndianRupee, CalendarPlus, Star, Quote,
} from 'lucide-react';
import { supabase }    from '@/lib/supabase';
import { useBooking }  from '@/hooks/useBooking';
import { useBookings } from '@/hooks/useBookings';
import { useAuth }     from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { paymentRepository } from '@/repositories/paymentRepository';
import { therapist } from '@/data/therapistData';
import { services }  from '@/data/servicesData';
import { formatShortDate, formatCurrency } from '@/utils/formatting';
import { generateReceipt } from '@/utils/receiptGenerator';
import { exportToICS }    from '@/utils/calendarExport';
import SEO from '@/components/common/SEO';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',         color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertCircle  },
  pending_payment:  { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: CreditCard   },
  confirmed:        { label: 'Confirmed',        color: 'bg-teal-50 text-teal-700 border-teal-200',   icon: CheckCircle2 },
  upcoming:         { label: 'Confirmed',        color: 'bg-teal-50 text-teal-700 border-teal-200',   icon: Clock        },
  completed:        { label: 'Completed',        color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-50 text-red-600 border-red-200',       icon: XCircle     },
  rescheduled:      { label: 'Rescheduled',      color: 'bg-blue-50 text-blue-600 border-blue-200',   icon: RefreshCw   },
  no_show:          { label: 'No Show',          color: 'bg-gray-50 text-text-gray border-gray-200',  icon: XCircle     },
};

const MODE_ICONS = { 'Video Call': Video, 'In-Person': MapPin, 'Phone Call': PhoneCall };

const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',     icon: LayoutDashboard },
  { id: 'upcoming',      label: 'Upcoming',     icon: Calendar         },
  { id: 'history',       label: 'History',      icon: History          },
  { id: 'payments',      label: 'Payments',     icon: CreditCard       },
  { id: 'testimonial',   label: 'Testimonial',  icon: Quote            },
  { id: 'notifications', label: 'Alerts',       icon: Bell             },
  { id: 'profile',       label: 'Profile',      icon: User             },
];

function StatusBadge({ status }) {
  const cfg  = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-label font-bold px-3 py-1 rounded-full border', cfg.color)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function SessionCard({ booking, onCancel, onRebook }) {
  const service  = services.find((s) => s.id === booking.sessionType);
  const ModeIcon = MODE_ICONS[booking.mode] || Video;
  const isUpcoming = ['confirmed', 'upcoming', 'pending', 'pending_payment'].includes(booking.status);

  const downloadReceipt = () => {
    generateReceipt({
      booking,
      amount:   booking.amount || 1500,
      txnId:    booking.transactionId,
      therapist,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-border-light shadow-level-1 overflow-hidden hover:shadow-level-2 transition-shadow duration-300"
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-body font-bold text-text-dark">{service?.title || booking.sessionType}</p>
            <p className="text-label text-text-gray mt-0.5">{therapist.name}</p>
          </div>
          <StatusBadge status={booking.status || 'upcoming'} />
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-y-3 gap-x-4 mb-5">
          {[
            { icon: Calendar,  value: booking.date ? formatShortDate(booking.date) : '—' },
            { icon: Clock,     value: booking.time || '—'             },
            { icon: ModeIcon,  value: booking.mode || '—'             },
            { icon: Clock,     value: service?.duration || '50 min'   },
          ].map(({ icon: Icon, value }, i) => (
            <div key={i} className="flex items-center gap-2 text-body-sm text-text-gray">
              <Icon className="w-3.5 h-3.5 text-coral shrink-0" />
              <span className="truncate">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={downloadReceipt}
            className="flex items-center gap-1.5 text-label font-semibold text-text-gray hover:text-coral border border-border-light hover:border-coral rounded-xl px-3 py-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Receipt
          </button>
          {isUpcoming && (
            <>
              <button
                onClick={() => exportToICS({ booking, therapist })}
                className="flex items-center gap-1.5 text-label font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-xl px-3 py-2 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                Add to Calendar
              </button>
              <Link
                to="/book"
                className="flex items-center gap-1.5 text-label font-semibold text-text-gray hover:text-coral border border-border-light hover:border-coral rounded-xl px-3 py-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reschedule
              </Link>
              <button
                onClick={() => onCancel(booking.id)}
                className="flex items-center gap-1.5 text-label font-semibold text-red-500 hover:text-red-700 border border-border-light hover:border-red-300 rounded-xl px-3 py-2 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          )}
          {!isUpcoming && (
            <button
              onClick={() => onRebook(booking)}
              className="flex items-center gap-1.5 text-label font-semibold text-coral border border-coral-200 bg-coral-50 rounded-xl px-3 py-2 hover:bg-coral-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Book Again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon = Calendar, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-16 gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-coral-50 flex items-center justify-center">
        <Icon className="w-8 h-8 text-coral" />
      </div>
      <div>
        <p className="font-body font-bold text-text-dark text-lg mb-1">{title}</p>
        <p className="text-body-sm text-text-gray max-w-xs">{message}</p>
      </div>
      {action}
    </motion.div>
  );
}

function OverviewTab({ bookings, onCancel, onRebook }) {
  const upcoming  = bookings.filter((b) => ['confirmed', 'upcoming', 'pending', 'pending_payment'].includes(b.status)).slice(0, 2);
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const total     = bookings.length;

  return (
    <motion.div variants={staggerContainer(0.08, 0.05)} initial="hidden" animate="visible">
      {/* Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Sessions',   value: total,     color: 'text-coral'        },
          { label: 'Completed',        value: completed, color: 'text-green-600'   },
          { label: 'Upcoming',         value: upcoming.length, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border-light p-4 flex sm:flex-col items-center sm:justify-center gap-4 sm:gap-1 shadow-level-1">
            <p className={cn('font-display font-bold text-2xl sm:text-3xl', color)}>{value}</p>
            <p className="text-label text-text-gray">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Therapist card */}
      <motion.div variants={staggerItem} className="bg-white rounded-2xl border border-border-light p-5 mb-8 shadow-level-1 flex gap-4 items-center">
        <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center text-coral font-bold font-display text-xl shrink-0">
          PS
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-bold text-text-dark">{therapist.name}</p>
          <p className="text-label text-coral">{therapist.title}</p>
          <p className="text-label text-text-gray mt-0.5 truncate">{therapist.availability}</p>
        </div>
        <Link to="/book" className="flex items-center gap-1.5 text-body-sm font-semibold text-coral hover:underline shrink-0">
          Book <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Next session */}
      <motion.div variants={staggerItem}>
        <h3 className="font-body font-bold text-text-dark mb-4">Upcoming Sessions</h3>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming sessions"
            message="Book your next session to continue your wellness journey."
            action={<Link to="/book" className="btn-primary text-body-sm px-5 py-2.5">Book a Session</Link>}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {upcoming.map((b) => (
              <SessionCard key={b.id} booking={b} onCancel={onCancel} onRebook={onRebook} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const UPCOMING_STATUSES = ['confirmed', 'upcoming', 'pending', 'pending_payment'];
const HISTORY_STATUSES  = ['completed', 'cancelled', 'no_show', 'rescheduled'];

function BookingsTab({ bookings, filter, onCancel, onRebook }) {
  const filtered = filter === 'upcoming'
    ? bookings.filter((b) => UPCOMING_STATUSES.includes(b.status))
    : filter === 'history'
    ? bookings.filter((b) => HISTORY_STATUSES.includes(b.status))
    : filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={filter}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{   opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No sessions found"
            message="No sessions match this filter."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((b) => (
              <SessionCard key={b.id} booking={b} onCancel={onCancel} onRebook={onRebook} />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function PaymentsTab({ userId }) {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    paymentRepository.getByUser(userId)
      .then((rows) => setPayments(rows || []))
      .finally(() => setLoading(false));

    // Realtime subscription for payments
    const channel = supabase
      .channel(`payments:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            setPayments((prev) => [payload.new, ...prev]);
            break;
          case 'UPDATE':
            setPayments((prev) => prev.map((p) => p.id === payload.new.id ? payload.new : p));
            break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const PAYMENT_STATUS = {
    paid:       { label: 'Paid',       color: 'bg-green-50 text-green-700 border-green-200' },
    pending:    { label: 'Pending',    color: 'bg-amber-50 text-amber-600 border-amber-200' },
    failed:     { label: 'Failed',     color: 'bg-red-50 text-red-600 border-red-200'       },
    cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-600 border-red-200'       },
    expired:    { label: 'Expired',    color: 'bg-gray-50 text-text-gray border-gray-200'   },
    refunded:   { label: 'Refunded',   color: 'bg-blue-50 text-blue-600 border-blue-200'    },
  };

  const resolvedStatus = (p) => {
    if (p.status === 'pending') {
      const age = Date.now() - new Date(p.created_at).getTime();
      if (age > 30 * 60 * 1000) return 'expired';
    }
    return p.status;
  };

  if (loading) return (
    <div className="flex flex-col gap-3">
      {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-cream-50 animate-pulse" />)}
    </div>
  );

  if (payments.length === 0) return (
    <EmptyState title="No payments yet" message="Your payment history will appear here after your first session." />
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
      {payments.map((p) => {
        const status = resolvedStatus(p);
        const cfg = PAYMENT_STATUS[status] || PAYMENT_STATUS.pending;
        return (
          <div key={p.id} className="bg-white rounded-2xl border border-border-light shadow-level-1 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <IndianRupee className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-body font-semibold text-text-dark">{p.booking?.service_title || 'Therapy Session'}</p>
                <p className="text-label text-text-gray mt-0.5">
                  {p.booking?.session_date ? formatShortDate(p.booking.session_date) : ''}
                  {p.booking?.session_time ? ` · ${p.booking.session_time}` : ''}
                </p>
                {p.razorpay_payment_id && (
                  <p className="text-label text-text-gray font-mono mt-0.5">{p.razorpay_payment_id}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="font-display font-bold text-lg text-text-dark">₹{(p.amount_inr || 0).toLocaleString('en-IN')}</p>
              <span className={cn('text-label font-bold px-2.5 py-0.5 rounded-full border', cfg.color)}>{cfg.label}</span>
              {status === 'paid' && (
                <button
                  onClick={() => generateReceipt({
                    booking: {
                      bookingRef: p.booking?.booking_ref,
                      service:    p.booking?.service_title,
                      date:       p.booking?.session_date,
                      time:       p.booking?.session_time,
                      mode:       p.booking?.session_mode,
                    },
                    amount:  p.amount_inr,
                    txnId:   p.razorpay_payment_id || p.provider_txn_id,
                    therapist,
                  })}
                  className="flex items-center gap-1.5 text-label text-teal-600 hover:text-teal-700 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Receipt
                </button>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function NotificationsTab() {
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();

  const TYPE_CONFIG = {
    payment_success:   { color: 'bg-green-50 text-green-700',  icon: CreditCard  },
    booking_confirmed: { color: 'bg-teal-50 text-teal-700',    icon: Calendar    },
    booking_cancelled: { color: 'bg-red-50 text-red-600',      icon: XCircle     },
    default:           { color: 'bg-gray-50 text-text-gray',   icon: Bell        },
  };

  if (loading) return (
    <div className="flex flex-col gap-3">
      {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-cream-50 animate-pulse" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {unreadCount > 0 && (
        <div className="flex justify-end mb-3">
          <button onClick={markAllRead} className="text-label text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>
      )}
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" message="You'll see booking and payment updates here." />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={cn(
                  'flex gap-3 p-4 rounded-2xl border transition-colors cursor-pointer',
                  n.is_read ? 'bg-white border-border-light' : 'bg-teal-50/40 border-teal-200'
                )}
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', cfg.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-body-sm text-text-dark', !n.is_read && 'font-semibold')}>{n.title}</p>
                  <p className="text-label text-text-gray mt-0.5">{n.body}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function ProfileTab() {
  const { profile, user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({ full_name: profile.full_name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: formData.full_name, phone: formData.phone });
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border-light shadow-level-1 overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-coral-100 flex items-center justify-center text-coral font-bold font-display text-2xl">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="font-body font-bold text-text-dark text-lg bg-transparent border-b border-coral focus:outline-none w-full"
              />
            ) : (
              <p className="font-body font-bold text-text-dark text-lg">{profile?.full_name || 'Your Name'}</p>
            )}
            <p className="text-label text-text-gray truncate">{profile?.email || user?.email}</p>
          </div>
          <button
            onClick={() => {
              if (editing) setFormData({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
              setEditing(!editing);
            }}
            className="text-label text-coral font-semibold hover:underline"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-label text-text-gray block mb-1.5">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-body-sm text-text-dark">{profile?.full_name || '—'}</p>
            )}
          </div>
          <div>
            <label className="text-label text-text-gray block mb-1.5">Mobile Number</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="input-field"
              />
            ) : (
              <p className="text-body-sm text-text-dark">{profile?.phone || '—'}</p>
            )}
          </div>
          <div>
            <label className="text-label text-text-gray block mb-1.5">Email</label>
            <p className="text-body-sm text-text-dark">{user?.email || '—'}</p>
          </div>
          <div>
            <label className="text-label text-text-gray block mb-1.5">Account Type</label>
            <p className="text-body-sm text-text-dark capitalize">{profile?.role || 'user'}</p>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {!editing && (
          <Link to="/book" className="btn-primary text-center">Book a New Session</Link>
        )}
      </div>
    </motion.div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star className={cn('w-6 h-6 transition-colors', s <= value ? 'fill-amber-400 text-amber-400' : 'text-border-light hover:text-amber-300')} />
        </button>
      ))}
    </div>
  );
}

function TestimonialTab({ user, profile }) {
  const [existing, setExisting]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ content: '', rating: 5, service_title: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('testimonials')
      .select('id, content, rating, service_title, is_approved, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setExisting(data); })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          user_id:       user.id,
          author_name:   profile?.full_name || user.email,
          author_role:   profile?.phone ? '' : '',
          content:       form.content.trim(),
          rating:        form.rating,
          service_title: form.service_title.trim() || null,
          is_approved:   false,
          is_featured:   false,
          is_visible:    true,
        })
        .select()
        .single();
      if (error) throw error;
      setExisting(data);
      setSubmitted(true);
    } catch (err) {
      console.error('[TestimonialTab] submit error', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-40 rounded-2xl bg-cream-50 animate-pulse" />;

  if (existing) {
    const statusCfg = existing.is_approved
      ? { label: 'Approved — visible on site', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 }
      : { label: 'Pending review', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertCircle };
    const StatusIcon = statusCfg.icon;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-border-light shadow-level-1 p-6 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-body font-bold text-text-dark">Your Testimonial</h3>
          <span className={cn('flex items-center gap-1.5 text-label font-semibold px-3 py-1 rounded-full border', statusCfg.color)}>
            <StatusIcon className="w-3.5 h-3.5" />{statusCfg.label}
          </span>
        </div>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => <Star key={s} className={cn('w-4 h-4', s <= existing.rating ? 'fill-amber-400 text-amber-400' : 'text-border-light')} />)}
        </div>
        <blockquote className="text-body text-text-gray italic leading-relaxed border-l-4 border-coral-100 pl-4">
          &ldquo;{existing.content}&rdquo;
        </blockquote>
        {existing.service_title && (
          <p className="text-label text-text-gray">Service: <span className="font-semibold text-text-dark">{existing.service_title}</span></p>
        )}
        {!existing.is_approved && (
          <p className="text-label text-text-gray bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
            Your testimonial has been submitted and is awaiting admin review. Once approved it will appear on the landing page.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border-light shadow-level-1 p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center shrink-0">
          <Quote className="w-5 h-5 text-coral" />
        </div>
        <div>
          <h3 className="font-body font-bold text-text-dark">Share Your Experience</h3>
          <p className="text-label text-text-gray">Your review will appear on our site after admin approval.</p>
        </div>
      </div>

      {submitted && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-body-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Submitted! We&apos;ll review it shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-label text-text-dark font-semibold block mb-2">Rating *</label>
          <StarPicker value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
        </div>
        <div>
          <label className="text-label text-text-dark font-semibold block mb-1.5">Your experience *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Share how your sessions helped you…"
            rows={5}
            required
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-off-white text-body text-text-dark focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral resize-none"
          />
        </div>
        <div>
          <label className="text-label text-text-dark font-semibold block mb-1.5">Service (optional)</label>
          <input
            type="text"
            value={form.service_title}
            onChange={(e) => setForm(f => ({ ...f, service_title: e.target.value }))}
            placeholder="e.g. Anxiety & Stress Counselling"
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-off-white text-body text-text-dark focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !form.content.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Testimonial'}
        </button>
      </form>
    </motion.div>
  );
}

function Dashboard() {
  const { isAuthenticated, user }                 = useAuth();
  const { bookings: dbBookings, cancel: dbCancel } = useBookings();
  const { bookings: localBookings, cancelBooking } = useBooking();

  const navigate = useNavigate();
  const [activeTab,     setActiveTab]     = useState('overview');
  const [historyFilter, setHistoryFilter] = useState('all');

  const [cancelConfirm, setCancelConfirm] = useState(null); // booking id to cancel

  // Use DB when authenticated, localStorage when not
  const rawBookings = isAuthenticated ? dbBookings : localBookings;

  const enrichedBookings = useMemo(() =>
    rawBookings.map((b) => ({
      ...b,
      status: b.status || 'pending',
      amount: b.amount_inr || b.amount || 1500,
    })), [rawBookings]);

  const handleCancel = (id) => {
    setCancelConfirm(id); // Show confirmation dialog
  };

  const confirmCancel = async () => {
    const id = cancelConfirm;
    setCancelConfirm(null);
    try {
      if (isAuthenticated) await dbCancel(id);
      else cancelBooking(id);
    } catch (err) {
      alert('Failed to cancel session: ' + err.message);
    }
  };

  const handleRebook = () => navigate('/book');

  return (
    <>
      <SEO title="My Dashboard" description="Manage your therapy sessions and bookings." path="/dashboard" noIndex />

      <div className="bg-off-white">
        {/* Top bar */}
        <div className="bg-white border-b border-border-light sticky top-[var(--nav-height)] z-30">
          <div className="max-w-container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Link to="/" className="flex items-center gap-1.5 text-body-sm font-semibold text-text-gray hover:text-coral transition-colors group shrink-0">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <span className="text-border-light shrink-0">/</span>
              <div className="flex items-center gap-2 min-w-0">
                <Heart className="w-4 h-4 text-coral shrink-0" />
                <span className="font-body font-bold text-text-dark text-sm truncate">My Dashboard</span>
              </div>
            </div>
            <Link to="/book" className="btn-primary text-sm px-4 py-2 min-h-[36px]">
              + New Session
            </Link>
          </div>
        </div>

        <div className="max-w-container mx-auto px-4 md:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[220px_1fr] gap-8">

            {/* Sidebar nav — desktop */}
            <aside className="hidden lg:flex flex-col gap-1">
              <p className="text-label font-bold text-text-gray uppercase tracking-wider px-3 mb-2">Navigation</p>
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-body-sm font-semibold transition-all duration-200 text-left',
                    activeTab === id
                      ? 'bg-coral-50 text-coral border border-coral-200'
                      : 'text-text-gray hover:bg-white hover:text-text-dark border border-transparent'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </aside>

            {/* Main content */}
            <main className="min-w-0">
              {/* Filter bar for history */}
              {activeTab === 'history' && (
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
                  {['all', 'confirmed', 'completed', 'cancelled'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={cn(
                        'px-4 py-2 rounded-full text-body-sm font-semibold whitespace-nowrap transition-all duration-200',
                        historyFilter === f
                          ? 'bg-coral text-white shadow-coral'
                          : 'bg-white border border-border-light text-text-gray hover:border-coral hover:text-coral'
                      )}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'overview'       && <OverviewTab bookings={enrichedBookings} onCancel={handleCancel} onRebook={handleRebook} />}
              {activeTab === 'upcoming'        && <BookingsTab bookings={enrichedBookings} filter="upcoming" onCancel={handleCancel} onRebook={handleRebook} />}
              {activeTab === 'history'         && <BookingsTab bookings={enrichedBookings} filter={historyFilter} onCancel={handleCancel} onRebook={handleRebook} />}
              {activeTab === 'payments'        && <PaymentsTab userId={user?.id} />}
              {activeTab === 'testimonial'      && <TestimonialTab user={user} profile={profile} />}
              {activeTab === 'notifications'   && <NotificationsTab />}
              {activeTab === 'profile'         && <ProfileTab />}
            </main>
          </div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <AnimatePresence>
          {cancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-level-3 max-w-sm w-full p-6"
              >
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 text-error" />
                  </div>
                  <div>
                    <h3 className="font-body font-bold text-text-dark mb-1">Cancel Session?</h3>
                    <p className="text-body-sm text-text-gray">
                      Are you sure you want to cancel this session? This action cannot be undone. Refunds follow our cancellation policy.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelConfirm(null)}
                    className="flex-1 py-2.5 bg-white text-text-dark font-semibold text-sm rounded-xl border border-border-light hover:bg-off-white transition-colors"
                  >
                    Keep Session
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="flex-1 py-2.5 bg-error text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile bottom nav */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border-light px-2 pt-2"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
        >
          <div className="flex justify-around">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
                  activeTab === id ? 'text-coral' : 'text-text-gray'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
