import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Video, MapPin, PhoneCall, Heart,
  Tag, ChevronRight, Loader2, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/hooks/useBooking';
import { useAuth } from '@/context/AuthContext';
import { BOOKING_STEPS } from '@/context/BookingContext';
import { services } from '@/data/servicesData';
import { pricingPlans } from '@/data/pricingData';
import { formatShortDate, formatCurrency } from '@/utils/formatting';
import { therapist } from '@/data/therapistData';

const modeIcons = {
  'Video Call': Video,
  'In-Person':  MapPin,
  'Phone Call': PhoneCall,
};

function SummaryRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-light last:border-0">
      <div className="w-8 h-8 rounded-lg bg-coral-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-coral" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label text-text-gray">{label}</p>
        <p className={cn('text-body-sm font-semibold mt-0.5 truncate', highlight ? 'text-coral' : 'text-text-dark')}>
          {value}
        </p>
      </div>
    </div>
  );
}

function BookingSummary() {
  const { user } = useAuth();
  const {
    selectedDate, selectedTime, selectedService, formData,
    appliedCoupon, discountAmount, applyCoupon, removeCoupon
  } = useBooking();

  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const serviceObj = selectedService ||
    services.find((s) => s.id === formData?.sessionType) ||
    null;

  const plan = pricingPlans.find((p) => p.id === 'single');
  const ModeIcon = modeIcons[formData?.mode] || Video;

  const hasAnySelection = selectedDate || selectedTime || serviceObj;

  const basePrice = serviceObj?.id === 'couples-counseling'
    ? 2500
    : plan ? plan.price : 1500;

  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await applyCoupon(couponInput.trim(), user?.id ?? null);
      setCouponInput('');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Therapist card */}
      <div className="bg-white rounded-[1.5rem] border border-border-light shadow-level-1 overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-coral" />
            </div>
            <div>
              <p className="font-body font-bold text-body-sm text-text-dark">{therapist.name}</p>
              <p className="text-label text-coral">{therapist.title}</p>
            </div>
          </div>

          <AnimatePresence>
            {hasAnySelection ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <SummaryRow icon={Calendar} label="Date"       value={selectedDate ? formatShortDate(selectedDate) : null} />
                <SummaryRow icon={Clock}    label="Time"       value={selectedTime}       />
                <SummaryRow icon={Tag}      label="Service"    value={serviceObj?.title}  />
                <SummaryRow icon={Clock}    label="Duration"   value={serviceObj?.duration} />
                <SummaryRow icon={ModeIcon} label="Mode"       value={formData?.mode}     />
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-body-sm text-text-gray text-center py-4"
              >
                Your selections will appear here.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pricing card */}
      <div className="bg-white rounded-[1.5rem] border border-border-light shadow-level-1 p-5 space-y-4">
        <div>
          <h4 className="font-body font-bold text-body-sm text-text-dark mb-3">Billing Summary</h4>
          <div className="space-y-2 text-body-sm">
            <div className="flex items-center justify-between text-text-gray">
              <span>Session Fee</span>
              <span>{formatCurrency(basePrice)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-green-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Promo ({appliedCoupon.code})
                </span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="border-t border-border-light pt-2 flex items-center justify-between font-bold text-text-dark">
              <span>Total Payable</span>
              <span className="text-coral text-body font-display">
                {formatCurrency(finalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Coupon Code Input */}
        {!appliedCoupon ? (
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-label text-text-dark font-semibold">Have a coupon code?</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. HEAL20"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                disabled={loading}
                className="flex-1 rounded-xl border border-border-light bg-off-white px-3 py-2 text-body-sm text-text-dark placeholder:text-text-gray font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-coral focus:border-coral transition-all uppercase"
              />
              <button
                type="submit"
                disabled={loading || !couponInput.trim()}
                className="bg-coral hover:bg-coral-600 disabled:opacity-50 text-white font-semibold text-body-sm px-4 py-2 rounded-xl transition-all flex items-center justify-center shrink-0 min-w-[70px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {errorMsg && (
              <div className="flex items-start gap-1.5 text-label text-error mt-1 bg-red-50 p-2 rounded-lg border border-red-100">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-label text-green-800 font-bold flex items-center gap-1">
                🎉 Code Applied
              </p>
              <p className="text-label text-green-700 font-semibold truncate font-mono">
                {appliedCoupon.code}
              </p>
            </div>
            <button
              onClick={removeCoupon}
              className="p-1 rounded-lg hover:bg-green-100 text-green-700 transition-colors"
              title="Remove Coupon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-cream-50 rounded-xl p-3 border border-cream-200 text-label text-text-gray space-y-1">
          <p className="flex items-center gap-1 font-semibold text-text-dark">
            <ChevronRight className="w-3 h-3 text-coral" /> Payment collected after confirmation
          </p>
          {appliedCoupon && (
            <p className="text-coral font-medium animate-pulse">
              ⏱ Coupon reserved for {appliedCoupon.validity_hours} hr{appliedCoupon.validity_hours !== 1 ? 's' : ''} during checkout.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingSummary;
