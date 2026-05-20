import { supabase } from '@/lib/supabase';
import { bookingRepository } from '@/repositories/bookingRepository';
import { paymentRepository } from '@/repositories/paymentRepository';

// Demo payment service for QA/testing without Razorpay
// Simulates full payment lifecycle with DB updates, notifications, and state transitions

export const demoPaymentService = {
  // Simulate payment with different outcomes
  async simulatePayment({ bookingId, userId, amountInr = 1500, outcome = 'success' }) {
    console.log('[DemoPayment] Simulating payment:', { bookingId, userId, amountInr, outcome });

    try {
      // Create payment record
      const payment = await paymentRepository.create({
        booking_id: bookingId,
        user_id: userId,
        amount_inr: amountInr,
        currency: 'INR',
        method: 'demo',
        provider: 'demo',
        status: 'pending',
        provider_txn_id: `demo_txn_${Date.now()}`,
        raw_response: { demo: true, outcome },
      });

      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 1500));

      // Update based on outcome
      let finalStatus = 'paid';
      let bookingStatus = 'confirmed';

      switch (outcome) {
        case 'success':
          finalStatus = 'paid';
          bookingStatus = 'confirmed';
          break;
        case 'failure':
          finalStatus = 'failed';
          bookingStatus = 'pending';
          await paymentRepository.updateStatus(payment.id, {
            status: 'failed',
            failure_reason: 'Demo payment failure',
            paidAt: null,
          });
          break;
        case 'pending':
          finalStatus = 'pending';
          bookingStatus = 'pending';
          await paymentRepository.updateStatus(payment.id, {
            status: 'pending',
            paidAt: null,
          });
          break;
        case 'cancelled':
          finalStatus = 'failed';
          bookingStatus = 'cancelled';
          await paymentRepository.updateStatus(payment.id, {
            status: 'failed',
            failure_reason: 'Payment cancelled by user',
            paidAt: null,
          });
          await bookingRepository.update(bookingId, {
            status: 'cancelled',
            cancellation_reason: 'Payment cancelled',
            cancelled_at: new Date().toISOString(),
          });
          break;
        default:
          throw new Error(`Invalid demo outcome: ${outcome}`);
      }

      // For success, complete the payment flow
      if (outcome === 'success') {
        await paymentRepository.updateStatus(payment.id, {
          status: 'paid',
          provider_txn_id: payment.provider_txn_id,
          paidAt: new Date().toISOString(),
        });

        // Redeem coupon if applicable
        await supabase.rpc('redeem_coupon', {
          p_booking_id: bookingId,
          p_payment_id: payment.provider_txn_id
        }).catch(err => console.warn('[DemoPayment] Coupon redemption error (non-fatal):', err));

        // Update booking status
        await bookingRepository.update(bookingId, {
          status: bookingStatus,
          payment_status: 'paid',
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'payment_success',
          title: 'Payment Successful',
          body: `Your payment of ₹${amountInr} was successful. Booking confirmed.`,
          data: { booking_id: bookingId, payment_id: payment.id },
        });
      }

      return {
        success: outcome === 'success',
        payment,
        bookingStatus,
        outcome,
      };
    } catch (err) {
      console.error('[DemoPayment] Error:', err);
      throw err;
    }
  },

  // Get available demo outcomes
  getOutcomes() {
    return [
      { value: 'success',   label: '✓ Success',   description: 'Payment completes successfully' },
      { value: 'failure',   label: '✗ Failure',   description: 'Payment fails due to error' },
      { value: 'pending',   label: '⏳ Pending',   description: 'Payment remains in pending state' },
      { value: 'cancelled', label: '✕ Cancelled', description: 'User cancels payment' },
    ];
  },

  // Get demo payment methods (visual only — map to outcomes)
  getMethods() {
    return ['UPI', 'Cards', 'Net Banking', 'Wallets'];
  },
};

// Check if demo mode is enabled
export function isDemoMode() {
  return import.meta.env.VITE_PAYMENT_MODE === 'demo';
}
