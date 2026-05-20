import { createContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { bookingService } from '@/services/bookingService';

export const BookingContext = createContext(null);

// ── Storage helpers ────────────────────────────────────────
const persist = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const retrieve = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

// ── Booking schema factory ─────────────────────────────────
export const createBookingId = () =>
  `TC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// ── Steps ──────────────────────────────────────────────────
export const BOOKING_STEPS = {
  DATE:         1,
  TIME:         2,
  DETAILS:      3,
  CONFIRMATION: 4,
};

export const STEP_LABELS = {
  1: 'Select Date',
  2: 'Choose Time',
  3: 'Your Details',
  4: 'Confirmed!',
};

// ── Initial form state ─────────────────────────────────────
const initialFormData = {
  name:        '',
  email:       '',
  phone:       '',
  sessionType: '',
  mode:        'Video Call',
  reason:      '',
  notes:       '',
};

export function BookingProvider({ children }) {
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.DATE);

  // Selection state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // Form state
  const [formData, setFormData] = useState(initialFormData);

  // Booking records
  const [bookings, setBookings] = useState(() => retrieve('tc_bookings', []));

  // Confirmed booking (for confirmation screen)
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // UI state
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [reservationExpiry, setReservationExpiry] = useState(null);

  // ── Navigation ───────────────────────────────────────────
  const goToStep = useCallback((step) => setCurrentStep(step), []);
  const nextStep = useCallback(() =>
    setCurrentStep((s) => Math.min(s + 1, BOOKING_STEPS.CONFIRMATION)), []);
  const prevStep = useCallback(() =>
    setCurrentStep((s) => Math.max(s - 1, BOOKING_STEPS.DATE)), []);

  // ── Coupon Logic ──────────────────────────────────────────
  const applyCoupon = useCallback(async (code, userId) => {
    try {
      const originalAmount = selectedService?.id === 'couples-counseling' ? 2500 : 1500;
      
      // Clean up stale reservations first
      await supabase.rpc('release_expired_coupon_reservations');

      // Validate the coupon
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: code.trim().toUpperCase(),
        p_user_id: userId,
        p_booking_amount: originalAmount
      });

      if (error) throw error;
      
      // The function returns array/table so we grab the first element
      const validation = Array.isArray(data) ? data[0] : data;

      if (!validation || !validation.is_valid) {
        throw new Error(validation?.error_message || 'Invalid coupon code');
      }

      // Fetch coupon metadata
      const { data: couponMeta, error: metaErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .single();

      if (metaErr) throw metaErr;

      setAppliedCoupon(couponMeta);
      setDiscountAmount(Number(validation.discount_amount));
      return { success: true, discountAmount: Number(validation.discount_amount) };
    } catch (err) {
      console.error('[BookingContext.applyCoupon] Failed:', err);
      throw err;
    }
  }, [selectedService]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setReservationExpiry(null);
  }, []);

  // ── Submit booking ───────────────────────────────────────
  const submitBooking = useCallback(async (formValues, userId = null) => {
    setIsSubmitting(true);
    try {
      let newBooking;
      const originalAmount = selectedService?.id === 'couples-counseling' ? 2500 : 1500;
      const finalAmount = Math.max(0, originalAmount - discountAmount);

      if (userId) {
        // Persist to Supabase with status=pending
        console.log('[BookingContext.submitBooking] Creating booking with:', { userId, selectedDate, selectedTime, selectedService });
        const dbRow = await bookingService.createBooking(userId, {
          ...formValues,
          date:      selectedDate,
          time:      selectedTime,
          service:   selectedService?.title || formValues.sessionType || 'Individual Therapy',
          serviceId: selectedService?.id    || null,
          duration:  selectedService?.duration || '50 min',
          mode:      formValues.mode || 'Video Call',
          amount:    finalAmount,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount,
        });

        // Reserve the coupon in database for this booking
        if (appliedCoupon) {
          const { error: reserveErr } = await supabase.rpc('reserve_coupon', {
            p_code: appliedCoupon.code,
            p_user_id: userId,
            p_booking_id: dbRow.id,
            p_booking_amount: originalAmount
          });
          if (reserveErr) {
            console.error('[BookingContext.submitBooking] Coupon reservation failed:', reserveErr);
            throw new Error(`Coupon reservation failed: ${reserveErr.message}`);
          }
          // Fetch updated reservation_expires_at
          const { data: updatedCoupon } = await supabase
            .from('coupons')
            .select('reservation_expires_at')
            .eq('code', appliedCoupon.code)
            .single();
          if (updatedCoupon) {
            setReservationExpiry(updatedCoupon.reservation_expires_at);
          }
        }

        console.log('[BookingContext.submitBooking] Booking created:', dbRow);
        newBooking = {
          id:          dbRow.id,
          bookingRef:  dbRow.booking_ref,
          createdAt:   dbRow.created_at,
          status:      'pending',
          date:        selectedDate,
          time:        selectedTime,
          service:     selectedService,
          duration:    selectedService?.duration || '50 min',
          amount:      finalAmount,
          discountAmount: discountAmount,
          couponCode:  appliedCoupon?.code || null,
          ...formValues,
        };
      } else {
        // localStorage fallback (unauthenticated — not allowed now due to auth gating)
        await new Promise((r) => setTimeout(r, 1000));
        newBooking = {
          id:        createBookingId(),
          createdAt: new Date().toISOString(),
          status:    'pending',
          date:      selectedDate,
          time:      selectedTime,
          service:   selectedService,
          duration:  selectedService?.duration || '50 min',
          amount:    finalAmount,
          discountAmount: discountAmount,
          couponCode:  appliedCoupon?.code || null,
          ...formValues,
        };
        setBookings((prev) => {
          const updated = [...prev, newBooking];
          persist('tc_bookings', updated);
          return updated;
        });
      }

      setConfirmedBooking(newBooking);
      setCurrentStep(BOOKING_STEPS.CONFIRMATION);
      return newBooking;
    } catch (err) {
      console.error('[BookingContext.submitBooking] Error:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, selectedTime, selectedService, appliedCoupon, discountAmount]);

  // ── Add / Cancel ─────────────────────────────────────────
  const addBooking = useCallback((booking) => {
    const newBooking = {
      id:        createBookingId(),
      createdAt: new Date().toISOString(),
      status:    'confirmed',
      ...booking,
    };
    setBookings((prev) => {
      const updated = [...prev, newBooking];
      persist('tc_bookings', updated);
      return updated;
    });
    return newBooking;
  }, []);

  const cancelBooking = useCallback((id) => {
    setBookings((prev) => {
      const updated = prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b);
      persist('tc_bookings', updated);
      return updated;
    });
  }, []);

  // ── Reset ────────────────────────────────────────────────
  const resetBooking = useCallback(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedService(null);
    setFormData(initialFormData);
    setCurrentStep(BOOKING_STEPS.DATE);
    setConfirmedBooking(null);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setReservationExpiry(null);
  }, []);

  const resetSelection = resetBooking;

  return (
    <BookingContext.Provider
      value={{
        // Steps
        currentStep, setCurrentStep, goToStep, nextStep, prevStep,
        BOOKING_STEPS, STEP_LABELS,
        // Selections
        selectedDate, setSelectedDate,
        selectedTime, setSelectedTime,
        selectedService, setSelectedService,
        // Form
        formData, setFormData,
        // Bookings
        bookings, addBooking, cancelBooking,
        // Submit
        submitBooking, isSubmitting,
        // Confirmation
        confirmedBooking, setConfirmedBooking,
        // Reset
        resetBooking, resetSelection,
        // Modal
        isBookingModalOpen, setBookingModalOpen,
        // Coupons
        appliedCoupon, discountAmount, reservationExpiry, applyCoupon, removeCoupon
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
