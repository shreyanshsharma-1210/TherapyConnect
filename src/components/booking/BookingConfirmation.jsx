import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Video, MapPin, PhoneCall, RefreshCw, Heart, CreditCard, Tag } from 'lucide-react';
import PaymentModal from '@/components/payment/PaymentModal';
import { useBooking } from '@/hooks/useBooking';
import { therapist } from '@/data/therapistData';
import { services } from '@/data/servicesData';
import { formatShortDate, formatCurrency } from '@/utils/formatting';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';

const modeIcons = {
  'Video Call': Video,
  'In-Person': MapPin,
  'Phone Call': PhoneCall,
};

function ConfirmationDetail({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-light last:border-0">
      <div className="w-9 h-9 rounded-xl bg-coral-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-coral" aria-hidden="true" />
      </div>
      <div>
        <p className="text-label text-text-gray">{label}</p>
        <p className="text-body-sm font-semibold text-text-dark mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      {/* Outer ring pulse */}
      <motion.div
        className="absolute inset-0 rounded-full bg-coral-100"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [1, 0.4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
      />
      {/* Inner circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-coral flex items-center justify-center shadow-coral"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <CheckCircle2 className="w-12 h-12 text-white" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function BookingConfirmation() {
  const { confirmedBooking, resetBooking } = useBooking();
  const [payOpen, setPayOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userCancelled, setUserCancelled] = useState(false);

  // Auto-open payment modal for pending bookings (only if user hasn't cancelled)
  useEffect(() => {
    if (confirmedBooking?.status === 'pending' && !paymentSuccess && !payOpen && !userCancelled) {
      const timer = setTimeout(() => setPayOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [confirmedBooking?.status, paymentSuccess, payOpen, userCancelled]);

  if (!confirmedBooking) return null;

  const serviceObj = services.find((s) => s.id === confirmedBooking.sessionType) || null;
  const ModeIcon = modeIcons[confirmedBooking.mode] || Video;

  const handlePaymentClose = () => {
    setPayOpen(false);
    setUserCancelled(true); // Mark that user explicitly cancelled
  };

  const handleResetBooking = () => {
    resetBooking();
    setUserCancelled(false); // Reset for next booking
  };

  const addToCalendarUrl = () => {
    const date = confirmedBooking.date?.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Therapy+Session+-+${therapist.name}&dates=${date}/${date}&details=Session+with+${therapist.name}&location=${encodeURIComponent(therapist.location)}`;
  };

  const displayAmount = confirmedBooking.amount ?? 1500;

  return (
    <motion.div
      variants={staggerContainer(0.1, 0.1)}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center max-w-lg mx-auto w-full"
    >
      {/* Animated checkmark */}
      {paymentSuccess ? (
        <motion.div variants={staggerItem}>
          <AnimatedCheck />
        </motion.div>
      ) : userCancelled ? (
        <motion.div variants={staggerItem} className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <RefreshCw className="w-10 h-10 text-error" />
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <CreditCard className="w-10 h-10 text-amber-600" />
        </motion.div>
      )}

      {/* Headline */}
      <motion.div variants={staggerItem} className="mb-2">
        <span className={`inline-flex items-center gap-2 text-label font-bold px-4 py-1.5 rounded-full border ${
          paymentSuccess ? 'bg-coral-50 text-coral border-coral-200'
          : userCancelled ? 'bg-red-50 text-error border-red-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <Heart className="w-3 h-3" />
          {paymentSuccess ? 'Booking Confirmed' : userCancelled ? 'Payment Cancelled' : 'Payment Pending'}
        </span>
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="font-display font-bold text-h2 text-text-dark mb-3"
      >
        {paymentSuccess ? "You're all set!" : userCancelled ? 'Payment Cancelled' : 'Complete your payment'}
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-body text-text-gray leading-relaxed mb-8 max-w-sm"
      >
        {paymentSuccess ? (
          <>Your session with <span className="font-semibold text-text-dark">{therapist.name}</span> has been confirmed. A confirmation email will be sent to <span className="font-semibold text-coral">{confirmedBooking.email}</span>.</>
        ) : userCancelled ? (
          <>Your payment was cancelled. Your booking is still reserved. You can complete the payment anytime below.</>
        ) : (
          <>Complete the payment to confirm your session with <span className="font-semibold text-text-dark">{therapist.name}</span>. Your booking is reserved.</>
        )}
      </motion.p>

      {/* Booking ID */}
      <motion.div
        variants={staggerItem}
        className="w-full bg-coral-50 border border-coral-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center justify-between"
      >
        <p className="text-body-sm text-coral-700 font-semibold">Booking ID</p>
        <p className="font-mono font-bold text-body-sm text-coral tracking-wide">{confirmedBooking.id}</p>
      </motion.div>

      {/* Booking details card */}
      <motion.div
        variants={staggerItem}
        className="w-full bg-white rounded-[1.5rem] border border-border-light shadow-level-1 overflow-hidden mb-6 text-left"
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />
        <div className="p-6">
          <ConfirmationDetail icon={Calendar} label="Date" value={confirmedBooking.date ? formatShortDate(confirmedBooking.date) : null} />
          <ConfirmationDetail icon={Clock} label="Time" value={confirmedBooking.time} />
          <ConfirmationDetail icon={Heart} label="Service" value={serviceObj?.title || confirmedBooking.sessionType} />
          <ConfirmationDetail icon={Clock} label="Duration" value={serviceObj?.duration || confirmedBooking.duration} />
          <ConfirmationDetail icon={ModeIcon} label="Mode" value={confirmedBooking.mode} />
          {confirmedBooking.discountAmount > 0 && (
            <div className="flex items-center gap-3 py-3 border-b border-border-light text-green-600 font-semibold text-body-sm">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-label text-text-gray">Discount Applied</p>
                <p>-{formatCurrency(confirmedBooking.discountAmount)} ({confirmedBooking.couponCode})</p>
              </div>
            </div>
          )}
          <ConfirmationDetail icon={CreditCard} label="Final Amount Payable" value={formatCurrency(displayAmount)} />
        </div>
      </motion.div>

      {/* Next-step instructions */}
      <motion.div
        variants={staggerItem}
        className="w-full bg-cream-50 rounded-2xl border border-cream-300 p-5 mb-8 text-left"
      >
        <p className="font-semibold text-body-sm text-text-dark mb-3">What happens next?</p>
        <ul className="flex flex-col gap-2.5 text-body-sm text-text-gray">
          {[
            'You\'ll receive a confirmation email within a few minutes.',
            'Charushri\'s team will send you the session link / address 24 hours before.',
            'Add the session to your calendar so you don\'t miss it.',
            'Cancel or reschedule up to 24 hours before with no charge.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-coral text-white text-label font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Pay Now banner */}
      {!paymentSuccess && !userCancelled && (
        <motion.div variants={staggerItem} className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 mb-1">
          <div>
            <p className="font-semibold text-body-sm text-amber-800">Complete your payment</p>
            <p className="text-label text-amber-600">Session reserved for checkout hold</p>
          </div>
          <button
            onClick={() => setPayOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-body-sm px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            Pay {formatCurrency(displayAmount)}
          </button>
        </motion.div>
      )}

      {/* Action buttons */}
      {userCancelled && !paymentSuccess ? (
        <motion.div variants={staggerItem} className="flex gap-3 w-full">
          <button
            onClick={() => { setUserCancelled(false); setPayOpen(true); }}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-body-sm transition-colors duration-200"
          >
            <CreditCard className="w-4 h-4" />
            Retry Payment
          </button>
          <button
            onClick={handleResetBooking}
            className="flex-1 py-3.5 px-5 rounded-xl border border-border-light text-text-dark font-semibold text-body-sm hover:border-error hover:text-error transition-colors duration-200"
          >
            Discard
          </button>
        </motion.div>
      ) : paymentSuccess ? (
        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 w-full">
          <a
            href={addToCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border-2 border-coral text-coral font-semibold text-body-sm hover:bg-coral-50 transition-colors duration-200"
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </a>
          <button
            onClick={handleResetBooking}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-coral text-white font-semibold text-body-sm hover:bg-coral-600 transition-colors duration-200 shadow-coral"
          >
            <RefreshCw className="w-4 h-4" />
            Book Another Session
          </button>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="flex gap-3 w-full">
          <button
            onClick={() => setPayOpen(true)}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-body-sm transition-colors duration-200 shadow-coral"
          >
            <CreditCard className="w-4 h-4" />
            Pay {formatCurrency(displayAmount)} Now
          </button>
          <button
            onClick={handleResetBooking}
            className="flex-1 py-3.5 px-5 rounded-xl border border-border-light text-text-dark font-semibold text-body-sm hover:border-coral hover:text-coral transition-colors duration-200"
          >
            Cancel
          </button>
        </motion.div>
      )}

      <PaymentModal
        isOpen={payOpen}
        onClose={handlePaymentClose}
        booking={confirmedBooking}
        amount={displayAmount}
        onPaymentSuccess={() => {
          setPaymentSuccess(true);
          setPayOpen(false);
          setUserCancelled(false); // Reset for successful payments
        }}
      />
    </motion.div>
  );
}

export default BookingConfirmation;
