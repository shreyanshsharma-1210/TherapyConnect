import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { STEP_LABELS } from '@/context/BookingContext';
import { cn } from '@/lib/utils';

const STEPS = [1, 2, 3, 4];

function BookingStepIndicator({ currentStep }) {
  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step;
          const isCurrent   = currentStep === step;
          const isLast      = idx === STEPS.length - 1;

          return (
            <li key={step} className={cn('flex items-center', !isLast && 'flex-1')}>
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-bold border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-coral border-coral text-white'
                      : isCurrent
                      ? 'bg-white border-coral text-coral shadow-focus'
                      : 'bg-white border-border-light text-text-gray'
                  )}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    step
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-label font-semibold whitespace-nowrap hidden sm:block',
                    isCurrent   ? 'text-coral'      :
                    isCompleted ? 'text-coral-400'   : 'text-text-gray'
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 relative overflow-hidden bg-border-light rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-coral rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > step ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default BookingStepIndicator;
