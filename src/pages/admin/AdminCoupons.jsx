import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Search, Trash2, Ban, RefreshCw, X, HelpCircle,
  Percent, Sparkles, Clock, Calendar, CheckCircle2, Ticket
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { couponRepository } from '@/repositories/couponRepository';
import {
  PageHeader, StatCard, AdminCard, StatusBadge,
  AdminBtn, AdminInput, AdminSelect
} from '@/components/admin/AdminComponents';
import { formatCurrency } from '@/utils/formatting';
import { useToast } from '@/context/ToastContext';
import { useInvalidation, keys } from '@/lib/invalidationManager';
import { useRealtimeSubscription } from '@/lib/realtime/realtimeManager';

// Countdown sub-component for active reservations
function ReservationCountdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft === 'Expired') {
    return <span className="text-label text-error font-semibold font-mono">Expired</span>;
  }
  return (
    <span className="text-label text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 font-mono font-semibold flex items-center gap-1 inline-flex shrink-0">
      <Clock className="w-3 h-3 animate-pulse" />
      {timeLeft}
    </span>
  );
}

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, reserved: 0, redeemed: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState('flat');
  const [amount, setAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('0');
  const [validityHours, setValidityHours] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Fetch all coupons and update stats
  const loadData = async () => {
    try {
      const data = await couponRepository.getAllCoupons();
      setCoupons(data);
      const currentStats = await couponRepository.getStats();
      setStats(currentStats);
    } catch (err) {
      toast({ type: 'error', title: 'Error loading coupons', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Centralized realtime subscription for coupons
  useRealtimeSubscription('coupons');

  // Trigger state invalidation and reload coupon lists + metrics
  useInvalidation(keys.COUPONS, loadData);

  useEffect(() => {
    loadData();
  }, []);

  // Helper to auto-generate code (collision safe)
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codeResult = 'HEAL-';
    for (let i = 0; i < 4; i++) {
      codeResult += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check if collision locally just to be user friendly
    const exists = coupons.some(c => c.code.toUpperCase() === codeResult.toUpperCase());
    if (exists) {
      generateRandomCode();
    } else {
      setCode(codeResult);
      if (formErrors.code) {
        setFormErrors(prev => ({ ...prev, code: null }));
      }
    }
  };

  const handleCancelCoupon = async (id) => {
    try {
      await couponRepository.updateCouponStatus(id, 'cancelled');
      toast({ type: 'success', title: 'Coupon Cancelled', description: 'The coupon is now inactive.' });
    } catch (err) {
      toast({ type: 'error', title: 'Error cancelling coupon', description: err.message });
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this coupon? This action cannot be undone.')) return;
    try {
      await couponRepository.deleteCoupon(id);
      toast({ type: 'success', title: 'Coupon Deleted', description: 'Coupon deleted from database.' });
    } catch (err) {
      toast({ type: 'error', title: 'Error deleting coupon', description: err.message });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!code.trim()) errors.code = 'Coupon code is required';
    if (!amount || Number(amount) <= 0) errors.amount = 'Amount must be greater than 0';
    if (type === 'percentage' && Number(amount) > 100) errors.amount = 'Percentage cannot exceed 100%';
    if (Number(minBookingAmount) < 0) errors.minBookingAmount = 'Minimum booking amount cannot be negative';
    if (Number(validityHours) <= 0) errors.validityHours = 'Validity hours must be positive';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        type,
        amount: Number(amount),
        max_discount_amount: type === 'percentage' && maxDiscountAmount ? Number(maxDiscountAmount) : null,
        min_booking_amount: Number(minBookingAmount),
        validity_hours: Number(validityHours),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        status: 'active'
      };

      await couponRepository.createCoupon(payload);
      toast({ type: 'success', title: 'Coupon Created', description: `Successfully created coupon: ${payload.code}` });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      toast({ type: 'error', title: 'Error creating coupon', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setType('flat');
    setAmount('');
    setMaxDiscountAmount('');
    setMinBookingAmount('0');
    setValidityHours('1');
    setExpiresAt('');
    setFormErrors({});
  };

  // Filter & Search Logic
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupon & Discount Engine"
        subtitle="Manage single-use promo codes, temporary reservations, and real-time redemptions."
        action={
          <AdminBtn onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Coupon
          </AdminBtn>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Coupons" value={stats.total} icon={Ticket} color="teal" />
        <StatCard label="Active" value={stats.active} icon={Sparkles} color="green" />
        <StatCard label="Reserved" value={stats.reserved} icon={Clock} color="amber" />
        <StatCard label="Redeemed" value={stats.redeemed} icon={CheckCircle2} color="teal" />
        <StatCard label="Expired / Cancelled" value={stats.expired} icon={Ban} color="coral" />
      </div>

      {/* Main CMS Layout */}
      <AdminCard title="Coupon Codes & System Status">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-gray" />
            <input
              type="text"
              placeholder="Search by code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
            <label className="text-body-sm text-text-gray shrink-0 font-medium">Filter Status:</label>
            <AdminSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5"
            >
              <option value="all">All Coupons</option>
              <option value="active">Active</option>
              <option value="reserved">Reserved</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </AdminSelect>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-border-light hover:bg-cream-50 text-text-gray transition-colors shrink-0"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Coupons List Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-body-sm text-text-gray">Loading coupon engine data…</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-16 bg-off-white/40 border border-dashed border-border-light rounded-2xl">
            <Tag className="w-12 h-12 text-text-gray/40 mx-auto mb-3" />
            <p className="font-body font-bold text-text-dark">No coupons found</p>
            <p className="text-body-sm text-text-gray mt-1">Try widening your search or create a new coupon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-light rounded-2xl">
            <table className="w-full border-collapse text-left text-body-sm">
              <thead>
                <tr className="bg-off-white border-b border-border-light text-text-dark font-semibold">
                  <th className="p-4">Promo Code</th>
                  <th className="p-4">Discount Type</th>
                  <th className="p-4">Amount / Value</th>
                  <th className="p-4">Min. Booking</th>
                  <th className="p-4">Res. Hold</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-text-dark">
                {filteredCoupons.map((c) => {
                  const isReserved = c.status === 'reserved';
                  const canCancel = c.status === 'active' || c.status === 'reserved';
                  const canDelete = c.status !== 'redeemed'; // Don't delete redeemed for audit trail

                  return (
                    <tr key={c.id} className="hover:bg-cream-50/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-teal-700 tracking-wider">
                        {c.code}
                      </td>
                      <td className="p-4 capitalize">
                        {c.type === 'percentage' ? (
                          <span className="flex items-center gap-1.5 text-coral font-medium">
                            <Percent className="w-3.5 h-3.5" /> Percentage
                          </span>
                        ) : (
                          <span className="text-text-dark font-medium">Flat Value</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold">
                        {c.type === 'percentage' ? (
                          <div>
                            {c.amount}%
                            {c.max_discount_amount && (
                              <p className="text-label text-text-gray font-normal">Max: ₹{c.max_discount_amount}</p>
                            )}
                          </div>
                        ) : (
                          formatCurrency(c.amount)
                        )}
                      </td>
                      <td className="p-4 text-text-gray">
                        {c.min_booking_amount > 0 ? formatCurrency(c.min_booking_amount) : 'None'}
                      </td>
                      <td className="p-4 text-text-gray font-medium">
                        {c.validity_hours} hr{c.validity_hours !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 text-text-gray">
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={c.status} />
                          {isReserved && c.reservation_expires_at && (
                            <ReservationCountdown expiresAt={c.reservation_expires_at} />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canCancel && (
                            <button
                              onClick={() => handleCancelCoupon(c.id)}
                              className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                              title="Cancel / Deactivate Coupon"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-error transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* CREATE COUPON MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { if (!submitting) setShowCreateModal(false); }}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-level-3 overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-border-light bg-off-white">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-600" />
                  <h3 className="font-body font-bold text-text-dark">Create Single-Use Coupon</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="p-1.5 rounded-lg hover:bg-cream-100 text-text-gray"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleCreateCouponSubmit} className="p-5 space-y-4">
                {/* Code Field with generator */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-label text-text-dark font-semibold">Promo Code</label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-label text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className={`w-full rounded-xl border px-4 py-2.5 text-body text-text-dark placeholder:text-text-gray outline-none transition-all focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white bg-off-white uppercase font-mono tracking-wider ${
                        formErrors.code ? 'border-error' : 'border-border-light'
                      }`}
                    />
                  </div>
                  {formErrors.code && <p className="text-label text-error">{formErrors.code}</p>}
                </div>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <AdminSelect
                    label="Discount Type"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setAmount('');
                      setMaxDiscountAmount('');
                    }}
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </AdminSelect>

                  <AdminInput
                    label={type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                    type="number"
                    placeholder={type === 'percentage' ? '15' : '500'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={formErrors.amount}
                  />
                </div>

                {/* Conditional Max Discount */}
                {type === 'percentage' && (
                  <AdminInput
                    label="Max Discount Cap (Optional)"
                    type="number"
                    placeholder="e.g. 1000"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  />
                )}

                {/* Min Booking and Hold time */}
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput
                    label="Min Booking Value (₹)"
                    type="number"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(e.target.value)}
                    error={formErrors.minBookingAmount}
                  />

                  <AdminInput
                    label="Hold Expiry (Hours)"
                    type="number"
                    step="0.1"
                    value={validityHours}
                    onChange={(e) => setValidityHours(e.target.value)}
                    error={formErrors.validityHours}
                    title="How long is this coupon reserved during checkout before automatically releasing back to active"
                  />
                </div>

                {/* Hard Expiry Date */}
                <AdminInput
                  label="Hard Expiry Date (Optional)"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />

                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-label text-teal-800 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
                  <p>
                    <strong>Single-Use logic:</strong> When checkout begins, this coupon is locked for the hold duration. It permanently becomes <em>redeemed</em> upon successful payment, or returns to <em>active</em> if checkout is cancelled, fails, or expires.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <AdminBtn
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </AdminBtn>
                  <AdminBtn type="submit" loading={submitting}>
                    Save Coupon
                  </AdminBtn>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
