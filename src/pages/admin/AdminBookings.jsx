import { useEffect, useState, useCallback } from 'react';
import { Search, X, Calendar, Clock, Video, MapPin, PhoneCall } from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { useBookings }    from '@/hooks/useBookings';
import { useAuth }       from '@/context/AuthContext';
import { useToast }       from '@/context/ToastContext';
import {
  PageHeader, AdminCard, StatusBadge, AdminBtn,
  AdminSelect, ConfirmDialog, EmptyState,
} from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['all','pending','confirmed','completed','cancelled','rescheduled','no_show'];
const MODE_ICONS = { video: Video, in_person: MapPin, phone: PhoneCall };

function BookingDrawer({ booking, onClose, onStatusChange }) {
  const [status,  setStatus]  = useState(booking.status);
  const [saving,  setSaving]  = useState(false);
  const { toast } = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await adminRepository.updateBookingStatus(booking.id, status);
      onStatusChange(booking.id, status);
      toast({ type: 'success', title: 'Status updated' });
      onClose();
    } catch {
      toast({ type: 'error', title: 'Failed to update status' });
    } finally {
      setSaving(false);
    }
  };

  const ModeIcon = MODE_ICONS[booking.session_mode] || Video;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-level-3 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
          <div>
            <p className="font-body font-bold text-text-dark">Booking Detail</p>
            <p className="text-label text-text-gray font-mono">#{booking.booking_ref}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cream-50 rounded-xl">
            <X className="w-4 h-4 text-text-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Client */}
          <div>
            <p className="text-label text-text-gray uppercase tracking-wide mb-2">Client</p>
            <p className="font-semibold text-text-dark">{booking.client_name}</p>
            <p className="text-body-sm text-text-gray">{booking.client_email}</p>
            {booking.client_phone && <p className="text-body-sm text-text-gray">{booking.client_phone}</p>}
          </div>

          {/* Session */}
          <div>
            <p className="text-label text-text-gray uppercase tracking-wide mb-2">Session</p>
            <p className="font-semibold text-text-dark">{booking.service_title}</p>
            <div className="flex items-center gap-3 mt-1 text-body-sm text-text-gray">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{booking.session_date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.session_time}</span>
              <span className="flex items-center gap-1"><ModeIcon className="w-3.5 h-3.5" />{booking.session_mode}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="text-label text-text-gray uppercase tracking-wide mb-2">Payment</p>
            <div className="flex items-center justify-between">
              <StatusBadge status={booking.payment_status} />
              <span className="font-semibold text-text-dark">₹{booking.amount_inr}</span>
            </div>
            {booking.transaction_id && (
              <p className="text-label text-text-gray font-mono mt-1">{booking.transaction_id}</p>
            )}
          </div>

          {/* Reason */}
          {booking.reason && (
            <div>
              <p className="text-label text-text-gray uppercase tracking-wide mb-2">Reason</p>
              <p className="text-body-sm text-text-dark bg-cream-50 rounded-xl p-3">{booking.reason}</p>
            </div>
          )}

          {/* Status update */}
          <div>
            <p className="text-label text-text-gray uppercase tracking-wide mb-2">Update Status</p>
            <AdminSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
              ))}
            </AdminSelect>
          </div>
        </div>

        <div className="p-6 border-t border-border-light shrink-0 flex gap-3">
          <AdminBtn variant="secondary" onClick={onClose} className="flex-1">Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={save} loading={saving} className="flex-1">Save</AdminBtn>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const { isAdmin } = useAuth();
  const { bookings: allBookings, loading } = useBookings({ forAdmin: true });
  const [search,    setSearch]    = useState('');
  const [status,   setStatus]   = useState('all');
  const [selected, setSelected] = useState(null);
  const { toast } = useToast();

  // Filter bookings locally based on status and search
  const filteredBookings = allBookings.filter((b) => {
    const statusMatch = status === 'all' || b.status === status;
    const searchMatch = !search || 
      b.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.client_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_ref?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const total = filteredBookings.length;

  const handleStatusChange = (id, newStatus) => {
    // Optimistic update - realtime will handle the actual sync
    // No action needed since useBookings has realtime subscription
  };

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${total} total sessions`} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray" />
          <input
            type="search"
            placeholder="Search by name, email, or ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white text-body outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-label font-semibold border transition-all duration-200 capitalize',
                status === s
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-text-gray border-border-light hover:border-teal-300'
              )}
            >
              {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>

      <AdminCard>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-xl bg-cream-50 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState title="No bookings found" message="Try adjusting your filters." />
        ) : (
          <div className="flex flex-col divide-y divide-border-light">
            {filteredBookings.map((b) => {
              const ModeIcon = MODE_ICONS[b.session_mode] || Video;
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-3.5 gap-3 cursor-pointer hover:bg-cream-50/50 -mx-5 px-5 transition-colors"
                  onClick={() => setSelected(b)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-body-sm font-semibold text-text-dark truncate">{b.client_name}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="flex items-center gap-3 text-label text-text-gray mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.session_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.session_time}</span>
                      <span className="flex items-center gap-1"><ModeIcon className="w-3 h-3" />{b.session_mode}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-body-sm font-semibold ${b.status === 'cancelled' ? 'text-red-400 line-through' : 'text-text-dark'}`}>
                      ₹{b.status === 'cancelled' ? 0 : (b.amount_inr || 0)}
                    </p>
                    <p className="text-label text-text-gray font-mono">{b.booking_ref}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
