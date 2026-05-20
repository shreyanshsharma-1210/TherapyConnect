import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDateAvailable } from '@/data/availabilityData';
import { useBooking } from '@/hooks/useBooking';
import { supabase } from '@/lib/supabase';

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function BookingCalendar() {
  const { selectedDate, setSelectedDate, nextStep } = useBooking();

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [direction, setDirection] = useState(1);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loading, setLoading] = useState(false);

  const daysInMonth  = useMemo(() => new Date(viewYear, viewMonth + 1, 0).getDate(), [viewYear, viewMonth]);
  const firstDayOfWeek = useMemo(() => new Date(viewYear, viewMonth, 1).getDay(), [viewYear, viewMonth]);

  const therapistId = 'afa3ff51-4c49-441b-a49c-e0d8d02240ab'; // Charushri Suhaney

  useEffect(() => {
    let active = true;
    setLoading(true);

    const startStr = toDateStr(viewYear, viewMonth, 1);
    const endStr = toDateStr(viewYear, viewMonth, daysInMonth);

    async function fetchMonthAvailability() {
      try {
        const { data, error } = await supabase.rpc('get_month_availability', {
          therapist_uuid: therapistId,
          start_date: startStr,
          end_date: endStr,
        });

        if (error) throw error;
        if (active && data) {
          const map = {};
          data.forEach(d => {
            map[d.check_date] = d.availability_level;
          });
          setAvailabilityMap(map);
        }
      } catch (err) {
        console.error('[BookingCalendar] Error fetching monthly availability:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchMonthAvailability();

    // Subscribe to database changes to trigger instant updates to availability dots
    const channel = supabase
      .channel('calendar-month-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchMonthAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_vacations' }, () => fetchMonthAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_time_ranges' }, () => fetchMonthAvailability())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'synced_calendar_events' }, () => fetchMonthAvailability())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [viewYear, viewMonth, daysInMonth]);

  const prevMonth = () => {
    setDirection(-1);
    setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; });
  };
  const nextMonth = () => {
    setDirection(1);
    setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; });
  };

  const canGoPrev = useMemo(() => {
    return !(viewYear === today.getFullYear() && viewMonth === today.getMonth());
  }, [viewYear, viewMonth, today]);

  // Build cells: leading nulls + days
  const cells = useMemo(() => {
    const arr = Array(firstDayOfWeek).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDayOfWeek, daysInMonth]);

  const handleDayClick = (day) => {
    if (!day) return;
    const date = new Date(viewYear, viewMonth, day);
    if (!isDateAvailable(date)) return;
    const str = toDateStr(viewYear, viewMonth, day);
    setSelectedDate(str);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border-light bg-white text-text-gray hover:border-coral hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-level-1"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={`${viewYear}-${viewMonth}`}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{    opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.2 }}
            className="font-display font-bold text-h4 text-text-dark"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </motion.h3>
        </AnimatePresence>

        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border-light bg-white text-text-gray hover:border-coral hover:text-coral transition-all duration-200 shadow-level-1"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-label text-text-gray font-semibold py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{    opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="grid grid-cols-7 gap-2"
          role="grid"
          aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
        >
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;

            const dateObj = new Date(viewYear, viewMonth, day);
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const isToday    = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
            const isSelected = selectedDate === dateStr;

            const isFutureMonSat = isDateAvailable(dateObj);
            const dbLevel = availabilityMap[dateStr]; // 'available' | 'limited' | 'full'
            const level = dbLevel || 'available';
            const available = isFutureMonSat && level !== 'full';

            return (
              <motion.button
                key={day}
                whileHover={available ? { scale: 1.04 } : {}}
                whileTap={available  ? { scale: 0.97 } : {}}
                transition={{ duration: 0.12 }}
                style={{ willChange: 'transform' }}
                onClick={() => handleDayClick(day)}
                disabled={!available}
                aria-label={`${day} ${MONTH_NAMES[viewMonth]}${!available ? ', unavailable' : ''}`}
                aria-selected={isSelected}
                role="gridcell"
                className={cn(
                  'relative flex flex-col items-center justify-center h-12 w-full rounded-[14px] text-body-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-coral text-white shadow-coral font-bold'
                    : isToday && available
                    ? 'bg-coral-50 text-coral border-2 border-coral/40'
                    : available
                    ? 'bg-white text-text-dark border border-border-light hover:border-coral hover:bg-coral-50 hover:text-coral'
                    : 'bg-transparent text-gray-300 cursor-not-allowed'
                )}
              >
                {day}
                {/* Availability dot */}
                {available && !isSelected && (
                  <span
                    className={cn(
                      'absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                      level === 'limited' ? 'bg-warning' : 'bg-success'
                    )}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-5 text-label text-text-gray">
        {[
          { color: 'bg-success',  label: 'Available'     },
          { color: 'bg-warning',  label: 'Limited slots' },
          { color: 'bg-gray-300', label: 'Fully booked'  },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Continue button */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <button
            onClick={nextStep}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-coral text-white font-semibold rounded-xl hover:bg-coral-600 transition-colors duration-200 shadow-coral"
          >
            <Calendar className="w-4 h-4" />
            Continue to Time Selection
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default BookingCalendar;
