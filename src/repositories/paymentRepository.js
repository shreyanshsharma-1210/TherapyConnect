import { supabase } from '@/lib/supabase';
import { query }    from '@/lib/apiError';

export const paymentRepository = {
  async create(payload) {
    return query(
      supabase.from('payments').insert(payload).select().single()
    );
  },

  async getByBooking(bookingId) {
    return query(
      supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
    );
  },

  async getByUser(userId) {
    return query(
      supabase
        .from('payments')
        .select('*, booking:bookings(booking_ref, session_date, session_time, service_title, session_mode)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  async updateStatus(id, { status, providerTxnId, failureReason, paidAt }) {
    return query(
      supabase
        .from('payments')
        .update({ status, provider_txn_id: providerTxnId, failure_reason: failureReason, paid_at: paidAt })
        .eq('id', id)
        .select()
        .single()
    );
  },

  // Create Razorpay order via Edge Function
  async createRazorpayOrder({ amountInr, bookingId }) {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount_inr: amountInr, booking_id: bookingId },
    });
    if (error) throw new Error(error.message || 'Failed to create payment order');
    if (data?.error) throw new Error(data.error);
    return data; // { order_id, amount, currency }
  },

  // Verify Razorpay payment via Edge Function
  async verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, user_id }) {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, user_id },
    });
    if (error) throw new Error(error.message || 'Payment verification failed');
    if (data?.error) throw new Error(data.error);
    
    // After successful verification, update booking status to confirmed
    if (data?.success) {
      // Redeem coupon if applicable
      await supabase.rpc('redeem_coupon', {
        p_booking_id: booking_id,
        p_payment_id: razorpay_payment_id
      }).catch(err => console.error('[paymentRepository] Coupon redemption failed:', err));

      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', booking_id);
      if (bookingErr) {
        console.error('[paymentRepository] Failed to update booking status:', bookingErr.message);
      } else {
        // Trigger Google Calendar sync
        supabase.functions.invoke('google-calendar-sync', {
          body: { action: 'outbound-sync', bookingId: booking_id, eventType: 'create' }
        }).catch((e) => console.error('[paymentRepository] Google Calendar sync trigger failed (non-fatal):', e));
      }
    }
    
    return data; // { success, payment_id }
  },
};
