/**
 * Availability data — deterministically generates available slots
 * based on the current date so the demo always looks "live".
 */

export const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat (0=Sun)

export const TIME_SLOT_GROUPS = {
  Morning: [
    { id: 'slot-1000', label: '10:00 AM', value: '10:00 AM', period: 'Morning' },
    { id: 'slot-1100', label: '11:00 AM', value: '11:00 AM', period: 'Morning' },
    { id: 'slot-1200', label: '12:00 PM', value: '12:00 PM', period: 'Morning' },
  ],
  Afternoon: [
    { id: 'slot-1400', label: '02:00 PM', value: '02:00 PM', period: 'Afternoon' },
    { id: 'slot-1500', label: '03:00 PM', value: '03:00 PM', period: 'Afternoon' },
    { id: 'slot-1600', label: '04:00 PM', value: '04:00 PM', period: 'Afternoon' },
  ],
  Evening: [
    { id: 'slot-1700', label: '05:00 PM', value: '05:00 PM', period: 'Evening' },
    { id: 'slot-1800', label: '06:00 PM', value: '06:00 PM', period: 'Evening' },
    { id: 'slot-1900', label: '07:00 PM', value: '07:00 PM', period: 'Evening' },
  ],
};

export const ALL_SLOTS = Object.values(TIME_SLOT_GROUPS).flat();

/**
 * Deterministically mark ~30% of slots as "booked" per date
 * using a simple hash so the same date always shows the same availability.
 */
export function getBookedSlots(dateStr) {
  if (!dateStr) return [];
  const seed = dateStr.split('-').reduce((acc, n) => acc + parseInt(n, 10), 0);
  return ALL_SLOTS
    .filter((_, i) => (seed + i * 7) % 3 === 0)
    .map((s) => s.value);
}

/**
 * Check if a date is available (is a working day + not in the past,
 * and not fully booked — for demo purposes all working days have slots).
 */
export function isDateAvailable(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  const dow = date.getDay();
  return WORKING_DAYS.includes(dow);
}

export function getAvailabilityLevel(dateStr) {
  const booked = getBookedSlots(dateStr);
  const total  = ALL_SLOTS.length;
  const free   = total - booked.length;
  if (free === 0) return 'full';
  if (free <= 2)  return 'limited';
  return 'available';
}
