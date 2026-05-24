import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '@/services/bookingService';
import { useAuth }        from '@/context/AuthContext';
import { realtimeManager } from '@/lib/realtimeManager';
import { useInvalidation, keys } from '@/lib/invalidationManager';

export function useBookings({ forAdmin = false } = {}) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.rpc('auto_complete_past_bookings').catch(e => console.warn('[useBookings] Auto-complete failed:', e));

      const data = forAdmin && isAdmin
        ? await bookingService.getAllBookings()
        : await bookingService.getUserBookings(user?.id);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, isAdmin, forAdmin]);

  // Reconnect & cross-tab stale-state recovery
  useInvalidation(keys.BOOKINGS, fetch);

  useEffect(() => {
    if (!isAuthenticated) { setBookings([]); setLoading(false); return; }

    setLoading(true);
    fetch()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('[useBookings] Failed to load bookings:', err);
        setBookings([]);
      });

    // Realtime subscription for bookings
    // Admins subscribe to all bookings, users to their own
    const filter = (forAdmin && isAdmin) ? undefined : `user_id=eq.${user?.id}`;
    const channel = realtimeManager.subscribe('bookings', {
      filter,
      onInsert: (newBooking) => {
        if (forAdmin && isAdmin) {
          setBookings((prev) => [newBooking, ...prev]);
        } else if (newBooking.user_id === user?.id) {
          setBookings((prev) => [...prev, newBooking]);
        }
      },
      onUpdate: (updatedBooking) => {
        if (forAdmin && isAdmin) {
          setBookings((prev) => prev.map((b) => b.id === updatedBooking.id ? updatedBooking : b));
        } else if (updatedBooking.user_id === user?.id) {
          setBookings((prev) => prev.map((b) => b.id === updatedBooking.id ? updatedBooking : b));
        }
      },
      onDelete: (deletedBooking) => {
        if (forAdmin && isAdmin) {
          setBookings((prev) => prev.filter((b) => b.id !== deletedBooking.id));
        } else if (deletedBooking.user_id === user?.id) {
          setBookings((prev) => prev.filter((b) => b.id !== deletedBooking.id));
        }
      },
    });

    return () => {
      const channelName = `realtime:bookings:${filter || 'all'}`;
      realtimeManager.unsubscribe(channelName);
    };
  }, [user, isAuthenticated, isAdmin, forAdmin, fetch]);

  const cancel = useCallback(async (id, reason = '') => {
    // Optimistic update — mark as cancelled immediately
    const previousBookings = [...bookings];
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));

    try {
      await bookingService.cancelBooking(id, reason);
      // Refetch to sync with DB
      await fetch();
    } catch (err) {
      // Rollback on error
      setBookings(previousBookings);
      throw err;
    }
  }, [bookings, fetch]);

  return { bookings, loading, error, refetch: fetch, cancel };
}
