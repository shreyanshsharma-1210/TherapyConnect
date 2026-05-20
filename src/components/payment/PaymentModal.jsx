import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, Lock, CreditCard, CheckCircle2,
  AlertCircle, Download, RefreshCw, PlayCircle, Loader2,
} from 'lucide-react';
import { cn }          from '@/lib/utils';
import { formatShortDate } from '@/utils/formatting';
import { therapist }   from '@/data/therapistData';
import { bookingService } from '@/services/bookingService';
import { useAuth }     from '@/context/AuthContext';
import { useToast }   from '@/context/ToastContext';
import { demoPaymentService, isDemoMode } from '@/services/demoPaymentService';
import { generateReceipt } from '@/utils/receiptGenerator';

const STATES = { SUMMARY: 'summary', PROCESSING: 'processing', SUCCESS: 'success', FAILURE: 'failure' };

function ProcessingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-5">
      {/* Animated circles */}
      <div className="relative w-20 h-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-coral"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.4 + i * 0.2, opacity: 0 }}
            transition={{ duration: 1.4, delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="w-8 h-8 text-coral" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-body font-bold text-h4 text-text-dark mb-1">Processing Payment…</p>
        <p className="text-body-sm text-text-gray">Please do not close this window.</p>
      </div>
      <div className="flex items-center gap-2 text-label text-coral bg-coral-50 px-4 py-2 rounded-full border border-coral-100">
        <Shield className="w-3.5 h-3.5" />
        Secured by Razorpay · 256-bit SSL
      </div>
    </div>
  );
}

function SuccessScreen({ txnId, booking, onClose, onDownload }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="flex flex-col items-center text-center py-6 gap-4"
    >
      {/* Animated check */}
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full bg-coral-100"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-coral flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>
      </div>

      <div>
        <h3 className="font-display font-bold text-h3 text-text-dark mb-1">Payment Successful!</h3>
        <p className="text-body-sm text-text-gray">A receipt has been sent to <strong className="text-text-dark">{booking?.email}</strong></p>
      </div>

      {/* Receipt card */}
      <div className="w-full bg-coral-50 border border-coral-200 rounded-2xl p-5 text-left">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-label text-coral-600 font-bold uppercase tracking-wider">Payment Receipt</p>
            <p className="text-body-sm text-text-dark font-semibold mt-0.5">{therapist.name}</p>
          </div>
          <span className="bg-success/10 text-success text-label font-bold px-3 py-1 rounded-full border border-green-200">Paid</span>
        </div>
        <div className="flex flex-col gap-2 text-body-sm">
          {[
            { label: 'Amount',         value: formatCurrency(booking?.amount || 1500) },
            { label: 'Transaction ID', value: txnId },
            { label: 'Date',           value: booking?.date ? formatShortDate(booking.date) : '—' },
            { label: 'Session',        value: booking?.sessionType || 'Therapy Session' },
            { label: 'Mode',           value: booking?.mode || 'Video Call' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-text-gray">{label}</span>
              <span className="font-semibold text-text-dark">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-accent text-accent rounded-xl font-semibold text-body-sm hover:bg-accent/5 transition-colors"
        >
          <Download className="w-4 h-4" />
          Receipt
        </button>
        <button
          onClick={onClose}
          className="flex-[2] flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl font-semibold text-body-sm hover:bg-accent-dark transition-colors shadow-level-2"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}

function FailureScreen({ onRetry, onClose, errMsg, onDownload }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-6 gap-4"
    >
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-error" />
      </div>
      <div>
        <h3 className="font-display font-bold text-h3 text-text-dark mb-1">Payment Failed</h3>
        <p className="text-body-sm text-text-gray">Your booking has been cancelled. No amount was charged.</p>
      </div>
      {errMsg && (
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-body-sm text-red-700 text-left">
          {errMsg}
        </div>
      )}
      <div className="flex gap-3 w-full">
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl font-semibold text-body-sm hover:bg-red-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Failed Receipt
        </button>
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-light text-text-dark rounded-xl font-semibold text-body-sm hover:border-accent hover:text-accent transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
    // Fallback timeout after 10 seconds
    setTimeout(() => resolve(false), 10000);
  });
}

function PaymentModal({ isOpen, onClose, booking, amount = 1500, onPaymentSuccess }) {
  const { user }   = useAuth();
  const [stage,    setStage]    = useState(STATES.SUMMARY);
  const [txnId,      setTxnId]      = useState('');
  const [errMsg,     setErrMsg]     = useState('');
  const [failReason, setFailReason] = useState('');
  const [demoOutcome, setDemoOutcome] = useState('success');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) { setTimeout(() => { setStage(STATES.SUMMARY); setErrMsg(''); }, 350); }
  }, [isOpen]);

  const handlePay = useCallback(async () => {
    if (!booking?.id) return;
    setStage(STATES.PROCESSING);
    setErrMsg('');

    try {
      // Demo mode for QA/testing
      if (isDemoMode()) {
        const result = await demoPaymentService.simulatePayment({
          bookingId: booking.id,
          userId: user?.id,
          amountInr: amount,
          outcome: demoOutcome,
        });

        if (result.success) {
          setTxnId(result.payment.provider_txn_id);
          setStage(STATES.SUCCESS);
          onPaymentSuccess?.();
        } else {
          setStage(STATES.FAILURE);
          setErrMsg('Demo payment failed');
        }
        return;
      }

      // Production Razorpay mode
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load payment gateway. Check your connection.');

      // Create Razorpay order via Edge Function
      const order = await bookingService.initiatePayment(
        booking.id,
        user?.id,
        amount
      );

      // Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id:    order.order_id,
          amount:      order.amount,
          currency:    order.currency || 'INR',
          name:        'TherapyConnect',
          description: booking.service || 'Therapy Session',
          image:       '/favicon.ico',
          prefill: {
            name:    booking.clientName  || user?.email || '',
            email:   booking.clientEmail || user?.email || '',
          },
          theme: { color: '#2A7A7B' },
          modal: { ondismiss: () => reject(new Error('dismissed')) },
          handler: async (response) => {
            try {
              const result = await bookingService.verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                booking_id:          booking.id,
                user_id:             user?.id,
              });
              if (result?.success) {
                setTxnId(response.razorpay_payment_id);
                setStage(STATES.SUCCESS);
                onPaymentSuccess?.();
                resolve();
              } else {
                reject(new Error('Verification failed'));
              }
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
        });
        rzp.on('payment.failed', (resp) => {
          console.warn('[Razorpay] Transient payment attempt failed:', resp.error);
          // Do not reject here so the user can retry another card/method within the active Razorpay modal session.
        });
        rzp.open();
      });
    } catch (err) {
      if (err.message === 'dismissed') {
        setStage(STATES.SUMMARY);
      } else {
        const reason = err.message || 'Payment failed';
        setErrMsg(reason);
        setFailReason(reason);
        setStage(STATES.FAILURE);
        // Cancel the booking in DB since payment failed
        bookingService.cancelBooking(booking.id, `Payment failed: ${reason}`)
          .catch((e) => console.warn('[PaymentModal] booking cancel after failure:', e));
      }
    }
  }, [booking, user, amount]);

  const handleDownload = useCallback(() => {
    generateReceipt({ booking, amount, txnId, therapist, status: 'paid' });
  }, [booking, amount, txnId]);

  const handleFailedDownload = useCallback(() => {
    generateReceipt({ booking, amount, txnId: null, therapist, status: 'failed', failureReason: failReason });
  }, [booking, amount, failReason]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            onClick={stage !== STATES.PROCESSING ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[61] flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-level-3 overflow-hidden max-h-[95vh] overflow-y-auto"
              initial={{ y: 60, scale: 0.97 }}
              animate={{ y: 0,  scale: 1    }}
              exit={{   y: 60, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* Top accent */}
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />

              {/* Header */}
              {stage !== STATES.PROCESSING && (
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-coral" />
                    <h2 className="font-body font-bold text-h4 text-text-dark">
                      {stage === STATES.SUCCESS ? 'Payment Complete' :
                       stage === STATES.FAILURE ? 'Payment Failed' : 'Secure Payment'}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-off-white transition-colors"
                    aria-label="Close payment modal"
                  >
                    <X className="w-4 h-4 text-text-gray" />
                  </button>
                </div>
              )}

              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  {stage === STATES.PROCESSING && (
                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ProcessingOverlay />
                    </motion.div>
                  )}

                  {stage === STATES.SUCCESS && (
                    <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <SuccessScreen txnId={txnId} booking={booking} onClose={onClose} onDownload={handleDownload} />
                    </motion.div>
                  )}

                  {stage === STATES.FAILURE && (
                    <motion.div key="failure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <FailureScreen onRetry={() => setStage(STATES.SUMMARY)} onClose={onClose} errMsg={errMsg} onDownload={handleFailedDownload} />
                    </motion.div>
                  )}

                  {stage === STATES.SUMMARY && (
                    <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                      {/* Session summary card */}
                      <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4">
                        <p className="text-label text-teal-600 font-semibold mb-1">Session Details</p>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-body font-bold text-text-dark">{booking?.service || 'Therapy Session'}</p>
                            <p className="text-body-sm text-text-gray mt-0.5">{booking?.mode || 'Video'} · {booking?.duration || '50 min'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-body-sm text-text-gray">{booking?.date ? formatShortDate(booking.date) : ''}</p>
                            <p className="text-body-sm font-semibold text-text-dark">{booking?.time || ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="bg-coral-50 rounded-2xl border border-coral-100 p-4 flex items-center justify-between">
                        <p className="text-label text-coral-600 font-semibold">Total Amount</p>
                        <p className="font-display font-bold text-3xl text-coral">₹{amount.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Payment methods strip */}
                      <div className="flex items-center justify-center gap-3 py-2">
                        {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((m) => (
                          <span key={m} className="text-label text-text-gray bg-off-white border border-border-light rounded-lg px-2.5 py-1">{m}</span>
                        ))}
                      </div>

                      {/* Security note */}
                      {isDemoMode() ? (
                        <div className="flex items-center gap-2 text-label text-amber-600 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200">
                          <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                          Demo Payment Mode — No real money charged
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-label text-text-gray bg-gray-50 rounded-xl px-3 py-2.5 border border-border-light">
                          <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          Secured by Razorpay · 256-bit SSL encryption
                        </div>
                      )}

                      {/* Demo outcome selector */}
                      {isDemoMode() && (
                        <div className="bg-off-white rounded-xl border border-border-light p-4">
                          <label className="text-label text-text-gray block mb-2">Demo Payment Outcome</label>
                          <div className="grid grid-cols-2 gap-2">
                            {demoPaymentService.getOutcomes().map((o) => (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() => setDemoOutcome(o.value)}
                                className={`text-body-sm px-3 py-2 rounded-lg border transition-colors ${
                                  demoOutcome === o.value
                                    ? 'bg-coral text-white border-coral'
                                    : 'bg-white text-text-dark border-border-light hover:border-coral'
                                }`}
                              >
                                {o.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pay and Cancel buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          className="flex-1 py-4 bg-white text-text-dark font-bold text-base rounded-xl border border-border-light hover:bg-off-white transition-colors"
                        >
                          Cancel
                        </button>
                        <motion.button
                          onClick={handlePay}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 py-4 bg-accent text-white font-bold text-base rounded-xl shadow-level-2 hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
                        >
                          {isDemoMode() ? <PlayCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          {isDemoMode() ? 'Pay' : 'Pay Securely'}
                        </motion.button>
                      </div>

                      <p className="text-center text-label text-text-gray">
                        {isDemoMode() ? 'This simulates a real payment for testing purposes' : 'You\'ll be redirected to Razorpay\'s secure checkout'}
                      </p>

                      {/* Cancel Confirmation Dialog */}
                      <AnimatePresence>
                        {showCancelConfirm && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white rounded-2xl shadow-level-3 max-w-sm w-full p-6"
                            >
                              <div className="flex items-start gap-3 mb-4">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-body font-bold text-text-dark mb-1">Cancel Payment?</h3>
                                  <p className="text-body-sm text-text-gray">
                                    Are you sure you want to cancel this payment? Your booking will remain in pending status.
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => setShowCancelConfirm(false)}
                                  className="flex-1 py-2.5 bg-white text-text-dark font-semibold text-sm rounded-xl border border-border-light hover:bg-off-white transition-colors"
                                >
                                  No, Go Back
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCancelConfirm(false);
                                    onClose();
                                  }}
                                  className="flex-1 py-2.5 bg-error text-white font-semibold text-sm rounded-xl hover:bg-error-dark transition-colors"
                                >
                                  Yes, Cancel
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PaymentModal;
