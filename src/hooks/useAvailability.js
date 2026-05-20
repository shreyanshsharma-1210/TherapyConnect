import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useBooking } from './useBooking';
import { TIME_SLOT_GROUPS } from '@/data/availabilityData';

export function useAvailability() {
  const { selectedDate } = useBooking();
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const therapistId = 'afa3ff51-4c49-441b-a49c-e0d8d02240ab'; // Admin therapist UUID (Charushri Suhaney)

  useEffect(() => {
    if (!selectedDate) {
      setBlockedSlots([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    async function fetchAvailability() {
      try {
        const { data, error } = await supabase.rpc('get_therapist_booked_slots', {
          therapist_uuid: therapistId,
          check_date: selectedDate,
        });

        if (error) throw error;
        if (active) {
          // data is an array of { slot_value, is_blocked, block_reason }
          const blocked = (data || [])
            .filter((d) => d.is_blocked)
            .map((d) => d.slot_value);
          setBlockedSlots(blocked);
        }
      } catch (err) {
        console.error('[useAvailability] Error fetching availability:', err);
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchAvailability();

    // Subscribe to realtime modifications for instant slot invalidation
    const channel = supabase
      .channel('availability-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_vacations' }, () => fetchAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_time_ranges' }, () => fetchAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'synced_calendar_events' }, () => fetchAvailability())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const slotGroups = useMemo(() => {
    const result = {};
    Object.entries(TIME_SLOT_GROUPS).forEach(([period, slots]) => {
      result[period] = slots.map((slot) => ({
        ...slot,
        isBooked: blockedSlots.includes(slot.value),
      }));
    });
    return result;
  }, [blockedSlots]);

  const availableCount = useMemo(() => {
    const allSlotsCount = 9;
    return allSlotsCount - blockedSlots.length;
  }, [blockedSlots]);

  const getAvailabilityLevel = (dateStr) => {
    if (blockedSlots.length === 9) return 'full';
    if (blockedSlots.length >= 7) return 'limited';
    return 'available';
  };

  const isDateAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    const dow = date.getDay();
    return dow !== 0; // Mon-Sat (Sunday is 0)
  };

  return {
    slotGroups,
    allBookedSlots: blockedSlots,
    availableCount,
    isDateAvailable,
    getAvailabilityLevel,
    loading,
    error,
  };
}
