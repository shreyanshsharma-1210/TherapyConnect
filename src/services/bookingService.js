import { bookingRepository } from '@/repositories/bookingRepository';
import { paymentRepository } from '@/repositories/paymentRepository';
import { friendlyError }     from '@/lib/apiError';
import { supabase }          from '@/lib/supabase';

// Valid booking status transitions
const VALID_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled', 'pending_payment'],
  pending_payment:  ['confirmed', 'cancelled'],
  confirmed:        ['upcoming', 'cancelled', 'completed'],
  upcoming:         ['completed', 'cancelled', 'no_show'],
  completed:        [], // Terminal state
  cancelled:        [], // Terminal state
  no_show:          [], // Terminal state
  rescheduled:      ['confirmed', 'cancelled'],
};

function isValidTransition(fromStatus, toStatus) {
  if (!VALID_TRANSITIONS[fromStatus]) return false;
  return VALID_TRANSITIONS[fromStatus].includes(toStatus);
}

export const bookingService = {
  async createBooking(userId, bookingData) {
    try {
      // Map UI mode values to DB enum values
      const modeMap = {
        'Video Call': 'video',
        'In-Person': 'in_person',
        'Phone Call': 'phone',
      };
      const payload = {
        user_id:          userId,
        service_id:       bookingData.serviceId || null,
        service_title:    bookingData.service   || 'Individual Therapy',
        service_duration: bookingData.duration  || '50 min',
        session_mode:     modeMap[bookingData.mode] || 'video',
        session_date:     bookingData.date,
        session_time:     bookingData.time,
        client_name:      bookingData.name,
        client_email:     bookingData.email,
        client_phone:     bookingData.phone   || null,
        reason:           bookingData.reason  || null,
        notes:            bookingData.notes   || null,
        amount_inr:       bookingData.amount  || 0,
        status:           'pending',
        payment_status:   'pending',
        coupon_code:      bookingData.couponCode || null,
        discount_amount_inr: bookingData.discountAmount || 0,
      };
      return await bookingRepository.create(payload);
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  // Step 1: Create Razorpay order + pending payment record
  async initiatePayment(bookingId, userId, amountInr) {
    try {
      // Create Razorpay order via Edge Function
      const order = await paymentRepository.createRazorpayOrder({ amountInr, bookingId });

      // Persist pending payment row with razorpay_order_id
      await paymentRepository.create({
        booking_id:        bookingId,
        user_id:           userId,
        amount_inr:        amountInr,
        currency:          'INR',
        provider:          'razorpay',
        status:            'pending',
        razorpay_order_id: order.order_id,
      });

      // Also stamp booking with order id
      await supabase
        .from('bookings')
        .update({ razorpay_order_id: order.order_id })
        .eq('id', bookingId);

      return order; // { order_id, amount, currency }
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  // Step 2: Verify after Razorpay checkout completes
  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, user_id }) {
    try {
      return await paymentRepository.verifyRazorpayPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        booking_id,
        user_id,
      });
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  async getUserBookings(userId) {
    try {
      const rows = await bookingRepository.getByUser(userId);
      return rows.map(mapBookingToFrontend);
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  async cancelBooking(id, reason) {
    try {
      // Fetch only the status column to avoid JOIN RLS issues
      const { data: current, error: fetchErr } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', id)
        .single();
      if (fetchErr) throw new Error(fetchErr.message);
      if (current && !isValidTransition(current.status, 'cancelled')) {
        throw new Error(`Cannot cancel booking with status: ${current.status}`);
      }
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || '',
        })
        .eq('id', id);
      if (updateErr) {
        console.error('[cancelBooking] update error:', updateErr);
        throw new Error(updateErr.message);
      }
      
      // Trigger Google Calendar sync deletion
      supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'outbound-sync', bookingId: id, eventType: 'delete' }
      }).catch((e) => console.warn('[cancelBooking] Google Calendar sync deletion failed (non-fatal):', e));

      return { id, status: 'cancelled' };
    } catch (err) {
      throw new Error(friendlyError(err));
    } finally {
      // Trigger cancellation email — truly non-fatal, runs regardless
      supabase.functions.invoke('send-email', {
        body: { template: 'booking_cancelled', booking_id: id },
      }).catch((e) => console.warn('[cancelBooking] email notification failed (non-fatal):', e));
    }
  },

  async updateStatus(bookingId, newStatus) {
    try {
      // Validate transition before updating
      const current = await bookingRepository.getById(bookingId);
      if (current && !isValidTransition(current.status, newStatus)) {
        throw new Error(`Invalid status transition from ${current.status} to ${newStatus}`);
      }
      await bookingRepository.update(bookingId, { status: newStatus });

      // Trigger Google Calendar sync hook
      const eventType = newStatus === 'cancelled' ? 'delete' : 'create';
      supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'outbound-sync', bookingId, eventType }
      }).catch((e) => console.warn('[updateStatus] Google Calendar sync failed (non-fatal):', e));
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  async getAllBookings() {
    try {
      return await bookingRepository.getAll();
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  async sendWelcomeEmail(email, name) {
    supabase.functions.invoke('send-email', {
      body: { template: 'welcome', to_email: email, extra: { name } },
    }).catch(console.error);
  },
};

function mapBookingToFrontend(row) {
  return {
    id:              row.id,
    bookingRef:      row.booking_ref,
    service:         row.service_title,
    serviceIcon:     row.service?.icon || 'Brain',
    date:            row.session_date,
    time:            row.session_time,
    mode:            row.session_mode,
    duration:        row.service_duration,
    status:          row.status,
    paymentStatus:   row.payment_status,
    amount:          row.amount_inr,
    transactionId:   row.transaction_id,
    razorpayOrderId: row.razorpay_order_id,
    clientName:      row.client_name,
    clientEmail:     row.client_email,
    cancelledAt:     row.cancelled_at,
    createdAt:       row.created_at,
  };
}

