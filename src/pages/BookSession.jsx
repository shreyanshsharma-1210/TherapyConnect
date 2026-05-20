import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Clock, Calendar, Heart } from 'lucide-react';
import BookingCalendar      from '@/components/booking/BookingCalendar';
import TimeSlotPicker       from '@/components/booking/TimeSlotPicker';
import BookingForm          from '@/components/booking/BookingForm';
import BookingConfirmation  from '@/components/booking/BookingConfirmation';
import BookingSummary       from '@/components/booking/BookingSummary';
import BookingStepIndicator from '@/components/booking/BookingStepIndicator';
import { useBooking }       from '@/hooks/useBooking';
import { BOOKING_STEPS, STEP_LABELS } from '@/context/BookingContext';
import { therapist }        from '@/data/therapistData';

const stepVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const stepDescriptions = {
  [BOOKING_STEPS.DATE]:         'Choose a date for our safe conversation.',
  [BOOKING_STEPS.TIME]:         'Pick a time that feels right for you.',
  [BOOKING_STEPS.DETAILS]:      'Share a little about your journey.',
  [BOOKING_STEPS.CONFIRMATION]: 'Your safe space is reserved.',
};

function BookSession() {
  const { currentStep, resetBooking } = useBooking();

  const prevStepRef   = useRef(currentStep);
  const direction     = currentStep > prevStepRef.current ? 1 : -1;
  prevStepRef.current = currentStep;

  const isConfirmed = currentStep === BOOKING_STEPS.CONFIRMATION;

  // Scroll to top on step change — instant to avoid fighting with AnimatePresence
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentStep]);

  // Reset only if user leaves the page before confirming
  useEffect(() => {
    return () => {
      if (currentStep !== BOOKING_STEPS.CONFIRMATION) resetBooking();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-off-white">
      {/* Booking step announcement for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {!isConfirmed && `Step ${currentStep} of 4: ${STEP_LABELS[currentStep]}`}
        {isConfirmed && 'Booking confirmed'}
      </div>

      {/* Page header */}
      <div className="bg-white border-b border-border-light sticky top-[var(--nav-height,72px)] z-30">
        <div className="max-w-container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-body-sm font-semibold text-text-gray hover:text-accent transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Sanctuary
          </Link>

          {!isConfirmed && (
            <div className="flex-1 max-w-xs hidden sm:block">
              <BookingStepIndicator currentStep={currentStep} />
            </div>
          )}

          <div className="flex items-center gap-2 text-label text-text-gray">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">A Completely Safe Space</span>
          </div>
        </div>

        {/* Mobile stepper */}
        {!isConfirmed && (
          <div className="sm:hidden px-4 pb-3">
            <BookingStepIndicator currentStep={currentStep} />
          </div>
        )}
      </div>

      <div className="max-w-container mx-auto px-4 md:px-8 py-10 lg:py-14">
        {/* Page title */}
        {!isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <h1 className="font-display font-bold text-h2 text-text-dark mb-2">
              Reserve Your Safe Space with{' '}
              <span className="text-accent-dark">{therapist.name}</span>
            </h1>
            <p className="text-body text-text-gray max-w-md mx-auto">
              {stepDescriptions[currentStep]}
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-5 mt-5 text-body-sm text-text-gray">
              {[
                { icon: Shield,   text: 'Deeply Confidential'    },
                { icon: Clock,    text: 'Gentle Transition'  },
                { icon: Heart,    text: 'Compassionate Listening'},
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 font-medium">
                  <Icon className="w-4 h-4 text-accent" />
                  {text}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main grid */}
        <div className={isConfirmed ? 'max-w-2xl mx-auto' : 'grid lg:grid-cols-3 gap-8 items-start'}>

          {/* Step panel */}
          <div className={isConfirmed ? '' : 'lg:col-span-2'}>
            {!isConfirmed && (
              <div className="flex items-center gap-2 mb-5">
                <span className="w-7 h-7 rounded-full bg-accent text-white text-label font-bold flex items-center justify-center shrink-0">
                  {currentStep}
                </span>
                <h2 className="font-body font-bold text-h4 text-text-dark">
                  {STEP_LABELS[currentStep]}
                </h2>
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-level-2 border border-border-light overflow-hidden">
              {/* Top accent */}
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #F3A683, #E77F67)' }} />

              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {currentStep === BOOKING_STEPS.DATE         && <BookingCalendar />}
                    {currentStep === BOOKING_STEPS.TIME         && <TimeSlotPicker  />}
                    {currentStep === BOOKING_STEPS.DETAILS      && <BookingForm     />}
                    {currentStep === BOOKING_STEPS.CONFIRMATION && <BookingConfirmation />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          {!isConfirmed && (
            <div className="hidden lg:block">
              <BookingSummary />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookSession;
