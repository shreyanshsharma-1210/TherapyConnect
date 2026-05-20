import { motion } from 'framer-motion';
import { Clock, Sun, Sunset, Moon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/hooks/useBooking';
import { useAvailability } from '@/hooks/useAvailability';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { SkeletonTimeSlots } from '@/components/ui/Skeleton';
import { formatShortDate } from '@/utils/formatting';

const periodIcons = { Morning: Sun, Afternoon: Sunset, Evening: Moon };
const periodColors = {
  Morning:   'text-yellow-500 bg-yellow-50',
  Afternoon: 'text-orange-500 bg-orange-50',
  Evening:   'text-indigo-500 bg-indigo-50',
};

function SlotButton({ slot, isSelected, onSelect }) {
  return (
    <motion.button
      variants={staggerItem}
      whileHover={!slot.isBooked ? { scale: 1.02 } : {}}
      whileTap={!slot.isBooked  ? { scale: 0.98 }         : {}}
      onClick={() => !slot.isBooked && onSelect(slot.value)}
      disabled={slot.isBooked}
      aria-pressed={isSelected}
      aria-label={`${slot.label}${slot.isBooked ? ' — fully booked' : ''}`}
      className={cn(
        'relative flex items-center justify-center py-3 px-2 rounded-[14px] text-body-sm font-semibold border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral',
        isSelected
          ? 'bg-coral text-white border-coral shadow-coral'
          : slot.isBooked
          ? 'bg-gray-50 text-gray-300 border-border-light cursor-not-allowed line-through'
          : 'bg-white text-text-dark border-border-light hover:border-coral hover:bg-coral-50 hover:text-coral'
      )}
    >
      {slot.label}
      {isSelected && (
        <motion.span
          layoutId="slot-selected-ring"
          className="absolute inset-0 rounded-[14px] border-2 border-coral-400"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

function TimeSlotPicker() {
  const { selectedDate, selectedTime, setSelectedTime, nextStep, prevStep } = useBooking();
  const { slotGroups, availableCount } = useAvailability();

  if (!selectedDate) return null;

  return (
    <div className="w-full">
      {/* Date reminder */}
      <div className="flex items-center gap-2 mb-5 p-3.5 rounded-[14px] bg-coral-50 border border-coral-100">
        <Clock className="w-4 h-4 text-coral shrink-0" />
        <span className="text-body-sm text-coral-700 font-semibold">
          {formatShortDate(selectedDate)}
        </span>
        <span className="text-label text-coral-500 ml-auto">
          {availableCount} slot{availableCount !== 1 ? 's' : ''} available
        </span>
      </div>

      {availableCount === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="w-10 h-10 text-warning" />
          <p className="font-semibold text-text-dark">No slots available</p>
          <p className="text-body-sm text-text-gray">Please select a different date.</p>
          <button onClick={prevStep} className="text-coral text-body-sm font-semibold hover:underline">
            ← Back to Calendar
          </button>
        </div>
      ) : (
        <>
          {/* Slot groups */}
          <div className="flex flex-col gap-6">
            {Object.entries(slotGroups).map(([period, slots]) => {
              const Icon  = periodIcons[period] || Clock;
              const color = periodColors[period];
              const hasAvailable = slots.some((s) => !s.isBooked);
              if (!hasAvailable) return null;
              return (
                <div key={period}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-body-sm font-bold text-text-dark">{period}</span>
                  </div>
                  <motion.div
                    className="grid grid-cols-3 gap-3"
                    variants={staggerContainer(0.05)}
                    initial="hidden"
                    animate="visible"
                  >
                    {slots.map((slot) => (
                      <SlotButton
                        key={slot.id}
                        slot={slot}
                        isSelected={selectedTime === slot.value}
                        onSelect={setSelectedTime}
                      />
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={prevStep}
              className="flex-1 py-3 px-4 rounded-xl border border-border-light text-text-dark font-semibold text-body-sm hover:border-coral hover:text-coral transition-all duration-200"
            >
              ← Back
            </button>
            <motion.button
              onClick={nextStep}
              disabled={!selectedTime}
              whileTap={selectedTime ? { scale: 0.97 } : {}}
              className={cn(
                'flex-[2] py-3 px-4 rounded-xl font-semibold text-body-sm transition-all duration-200',
                selectedTime
                  ? 'bg-coral text-white shadow-coral hover:bg-coral-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              Continue to Details →
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

export default TimeSlotPicker;
