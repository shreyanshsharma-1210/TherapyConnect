import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Shield, Clock } from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import BookingCalendar        from '@/components/booking/BookingCalendar';
import TimeSlotPicker         from '@/components/booking/TimeSlotPicker';
import BookingForm            from '@/components/booking/BookingForm';
import BookingConfirmation    from '@/components/booking/BookingConfirmation';
import BookingSummary         from '@/components/booking/BookingSummary';
import BookingStepIndicator   from '@/components/booking/BookingStepIndicator';
import { useBooking } from '@/hooks/useBooking';
import { BOOKING_STEPS, STEP_LABELS } from '@/context/BookingContext';

const stepVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const stepDescriptions = {
  [BOOKING_STEPS.DATE]:         'Choose a date that works for you.',
  [BOOKING_STEPS.TIME]:         'Pick a convenient time slot.',
  [BOOKING_STEPS.DETAILS]:      'Tell us a little about yourself.',
  [BOOKING_STEPS.CONFIRMATION]: 'Your session is confirmed!',
};

function BookingSection() {
  const { currentStep } = useBooking();
  const prevStepRef     = useRef(currentStep);
  const direction       = currentStep > prevStepRef.current ? 1 : -1;
  prevStepRef.current   = currentStep;

  const isConfirmed = currentStep === BOOKING_STEPS.CONFIRMATION;

  return (
    <Section id="booking" bg="offwhite">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral-50/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cream-100/80 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Section header */}
        {!isConfirmed && (
          <Heading
            align="center"
            subtitle="Book a session in just 3 simple steps. No long wait times."
          >
            Book Your Session
          </Heading>
        )}

        {/* Trust strip */}
        {!isConfirmed && (
          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-10 text-body-sm text-text-gray"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {[
              { icon: Shield, text: 'Fully Confidential'       },
              { icon: Clock,  text: 'Instant Confirmation'     },
              { icon: Calendar, text: 'Free 15-min Intro Call' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 font-medium">
                <Icon className="w-4 h-4 text-coral" />
                {text}
              </span>
            ))}
          </motion.div>
        )}

        {/* Step indicator */}
        {!isConfirmed && (
          <div className="max-w-xl mx-auto mb-10">
            <BookingStepIndicator currentStep={currentStep} />
          </div>
        )}

        {/* Main layout */}
        <div className={isConfirmed ? 'max-w-2xl mx-auto' : 'grid lg:grid-cols-3 gap-8 items-start'}>

          {/* Step panel */}
          <div className={isConfirmed ? '' : 'lg:col-span-2'}>
            <div className="bg-white rounded-[2rem] shadow-level-2 border border-border-light overflow-hidden">
              {/* Step header bar */}
              {!isConfirmed && (
                <div className="px-7 pt-7 pb-5 border-b border-border-light">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-6 h-6 rounded-full bg-coral text-white text-label font-bold flex items-center justify-center shrink-0">
                      {currentStep}
                    </span>
                    <h3 className="font-body font-bold text-h4 text-text-dark">
                      {STEP_LABELS[currentStep]}
                    </h3>
                  </div>
                  <p className="text-body-sm text-text-gray pl-8">
                    {stepDescriptions[currentStep]}
                  </p>
                </div>
              )}

              {/* Animated step content */}
              <div className="p-7">
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
                    {currentStep === BOOKING_STEPS.TIME         && <TimeSlotPicker />}
                    {currentStep === BOOKING_STEPS.DETAILS      && <BookingForm />}
                    {currentStep === BOOKING_STEPS.CONFIRMATION && <BookingConfirmation />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Summary sidebar — hidden on confirmation */}
          {!isConfirmed && (
            <div className="hidden lg:block">
              <BookingSummary />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

export default BookingSection;
