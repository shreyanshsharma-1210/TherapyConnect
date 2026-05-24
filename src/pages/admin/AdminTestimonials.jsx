import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Star, CheckCircle2, XCircle, Plus, X,
  BadgeCheck, Shield, UserCheck, Upload, Sparkles,
  Clock, Tag,
} from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { useToast }        from '@/context/ToastContext';
import {
  PageHeader, AdminCard, AdminBtn, ConfirmDialog, EmptyState,
} from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const FILTER_OPTIONS = ['all', 'approved', 'pending'];

const SOURCE_BADGES = {
  user_submission: { label: 'User', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  admin_import:    { label: 'Admin Import', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  legacy:          { label: 'Legacy', color: 'bg-amber-50 text-amber-600 border-amber-200' },
};

const EMPTY_FORM = {
  author_name:  '',
  author_role:  '',
  content:      '',
  rating:       5,
  author_avatar:'',
  is_featured:  false,
  is_verified:  true,
  is_approved:  true,
  service_title:'',
  source_type:  'admin_import',
  created_at:   new Date().toISOString().split('T')[0],
};

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn('w-3 h-3', i <= rating ? 'fill-amber-400 text-amber-400' : 'text-border-light')} />
      ))}
    </div>
  );
}

function SourceBadge({ sourceType }) {
  const cfg = SOURCE_BADGES[sourceType] || SOURCE_BADGES.user_submission;
  return (
    <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border', cfg.color)}>
      {cfg.label}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={cn('w-6 h-6 transition-colors', s <= value ? 'fill-amber-400 text-amber-400' : 'text-border-light hover:text-amber-300')} />
        </button>
      ))}
    </div>
  );
}

function ImportModal({ onClose, onSaved }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const { toast } = useToast();

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const payload = {
        author_name:  form.author_name.trim(),
        author_role:  form.author_role.trim() || null,
        author_avatar: form.author_avatar.trim() || null,
        content:      form.content.trim(),
        rating:       form.rating,
        service_title: form.service_title.trim() || null,
        is_featured:  form.is_featured,
        is_verified:  form.is_verified,
        is_approved:  form.is_approved,
        is_visible:   true,
        source_type:  form.source_type,
        user_id:      null,
        created_at:   form.created_at ? new Date(form.created_at).toISOString() : new Date().toISOString(),
      };
      await adminRepository.upsertTestimonial(payload);
      toast({ type: 'success', title: 'Testimonial added' });
      onSaved();
      onClose();
    } catch (err) {
      console.error('[ImportModal] save error:', err);
      toast({ type: 'error', title: 'Failed to save testimonial', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { if (!saving) onClose(); }}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-level-3 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-light bg-off-white shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-600" />
            <h3 className="font-body font-bold text-text-dark">Add Testimonial</h3>
            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Admin Import</span>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-cream-100 text-text-gray transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Author name + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-text-dark font-semibold block mb-1.5">Client Name *</label>
              <input
                type="text"
                value={form.author_name}
                onChange={e => set('author_name', e.target.value)}
                placeholder="e.g. Priya M."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
              />
            </div>
            <div>
              <label className="text-label text-text-dark font-semibold block mb-1.5">Role / Title</label>
              <input
                type="text"
                value={form.author_role}
                onChange={e => set('author_role', e.target.value)}
                placeholder="e.g. Working Professional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-label text-text-dark font-semibold block mb-1.5">Testimonial Content *</label>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="The client's experience in their own words…"
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all resize-none"
            />
            <p className="text-[11px] text-text-gray mt-1 text-right">{form.content.length} chars</p>
          </div>

          {/* Rating */}
          <div>
            <label className="text-label text-text-dark font-semibold block mb-2">Rating *</label>
            <StarPicker value={form.rating} onChange={v => set('rating', v)} />
          </div>

          {/* Service + Avatar URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label text-text-dark font-semibold block mb-1.5">Service (optional)</label>
              <input
                type="text"
                value={form.service_title}
                onChange={e => set('service_title', e.target.value)}
                placeholder="e.g. Anxiety Counselling"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
              />
            </div>
            <div>
              <label className="text-label text-text-dark font-semibold block mb-1.5">Avatar URL (optional)</label>
              <input
                type="url"
                value={form.author_avatar}
                onChange={e => set('author_avatar', e.target.value)}
                placeholder="https://…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
              />
            </div>
          </div>

          {/* Created Date */}
          <div>
            <label className="text-label text-text-dark font-semibold block mb-1.5">Date Received</label>
            <input
              type="date"
              value={form.created_at}
              onChange={e => set('created_at', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
            />
          </div>

          {/* Source Type */}
          <div>
            <label className="text-label text-text-dark font-semibold block mb-1.5">Source Type</label>
            <select
              value={form.source_type}
              onChange={e => set('source_type', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-off-white text-body-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
            >
              <option value="admin_import">Admin Import</option>
              <option value="legacy">Legacy (Pre-Platform)</option>
              <option value="user_submission">User Submission</option>
            </select>
          </div>

          {/* Toggles row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { field: 'is_featured', label: 'Featured', icon: <Star className="w-3.5 h-3.5" />, color: 'amber' },
              { field: 'is_verified', label: 'Verified',  icon: <BadgeCheck className="w-3.5 h-3.5" />, color: 'teal' },
              { field: 'is_approved', label: 'Approved',  icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'green' },
            ].map(({ field, label, icon, color }) => (
              <button
                key={field}
                type="button"
                onClick={() => set(field, !form[field])}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-label font-semibold transition-all duration-200',
                  form[field]
                    ? color === 'amber'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : color === 'teal'
                      ? 'border-teal-400 bg-teal-50 text-teal-700'
                      : 'border-green-400 bg-green-50 text-green-700'
                    : 'border-border-light bg-off-white text-text-gray'
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-label text-violet-800 flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 text-violet-600 mt-0.5" />
            <p>Admin-imported testimonials bypass session eligibility checks. Mark as verified and approved to publish immediately.</p>
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-5 border-t border-border-light shrink-0 flex gap-3">
          <AdminBtn variant="secondary" onClick={onClose} disabled={saving} className="flex-1">
            Cancel
          </AdminBtn>
          <AdminBtn variant="primary" onClick={handleSubmit} loading={saving} className="flex-1">
            Add Testimonial
          </AdminBtn>
        </div>
      </motion.div>
    </div>
  );
}

import { useInvalidation, keys } from '@/lib/invalidationManager';
import { useRealtimeSubscription } from '@/lib/realtime/realtimeManager';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [deleting,     setDeleting]     = useState(null);
  const [showImport,   setShowImport]   = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { setTestimonials(await adminRepository.getAllTestimonials()); }
    catch { toast({ type: 'error', title: 'Failed to load testimonials' }); }
    finally { setLoading(false); }
  }, [toast]);

  // Centralized realtime subscription
  useRealtimeSubscription('testimonials');

  // Handle live realtime updates in the background
  useInvalidation(keys.TESTIMONIALS, load);

  useEffect(() => { load(); }, [load]);

  const filtered = testimonials.filter(t => {
    if (filter === 'approved') return t.is_approved;
    if (filter === 'pending')  return !t.is_approved;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.is_approved).length;

  const toggleApproval = async (t) => {
    try {
      const updated = await adminRepository.upsertTestimonial({ id: t.id, is_approved: !t.is_approved });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_approved: updated.is_approved } : x));
      toast({ type: 'success', title: updated.is_approved ? 'Approved — now live' : 'Approval removed' });
    } catch { toast({ type: 'error', title: 'Failed to update' }); }
  };

  const toggleFeatured = async (t) => {
    try {
      const updated = await adminRepository.upsertTestimonial({ id: t.id, is_featured: !t.is_featured });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_featured: updated.is_featured } : x));
      toast({ type: 'success', title: updated.is_featured ? 'Marked featured' : 'Removed from featured' });
    } catch { toast({ type: 'error', title: 'Failed to update' }); }
  };

  const toggleVerified = async (t) => {
    try {
      const updated = await adminRepository.upsertTestimonial({ id: t.id, is_verified: !t.is_verified });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_verified: updated.is_verified } : x));
      toast({ type: 'success', title: updated.is_verified ? 'Marked as verified' : 'Verification removed' });
    } catch { toast({ type: 'error', title: 'Failed to update' }); }
  };

  const handleDelete = async () => {
    try {
      await adminRepository.deleteTestimonial(deleting.id);
      setTestimonials(prev => prev.filter(t => t.id !== deleting.id));
      toast({ type: 'success', title: 'Testimonial deleted' });
    } catch { toast({ type: 'error', title: 'Delete failed' }); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle={`${pendingCount} pending · ${testimonials.length} total`}
        action={
          <AdminBtn onClick={() => setShowImport(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Testimonial
          </AdminBtn>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-label font-semibold border transition-all duration-200 capitalize',
              filter === f
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-text-gray border-border-light hover:border-teal-300'
            )}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <AdminCard>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-cream-50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No testimonials"
            message="User-submitted or imported testimonials will appear here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border-light">
            {filtered.map((t) => (
              <div key={t.id} className="py-4 flex items-start gap-4">
                {/* Avatar */}
                {t.author_avatar ? (
                  <img src={t.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5 border border-border-light" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-body-sm shrink-0 mt-0.5">
                    {t.author_name?.[0]}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Name + badges row */}
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-body-sm font-semibold text-text-dark">{t.author_name}</p>
                    {t.author_role && <p className="text-label text-text-gray">· {t.author_role}</p>}
                    <StarRating rating={t.rating} />

                    {/* Source badge */}
                    <SourceBadge sourceType={t.source_type || 'user_submission'} />

                    {/* Verified badge */}
                    {t.is_verified && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}

                    {/* Completed sessions indicator (for user submissions) */}
                    {t.source_type === 'user_submission' && t.completed_sessions_count !== undefined && (
                      <span className={cn(
                        'flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
                        t.completed_sessions_count > 0
                          ? 'text-green-700 bg-green-50 border-green-200'
                          : 'text-gray-500 bg-gray-50 border-gray-200'
                      )}>
                        <UserCheck className="w-3 h-3" />
                        {t.completed_sessions_count} session{t.completed_sessions_count !== 1 ? 's' : ''}
                      </span>
                    )}

                    {/* Featured badge */}
                    {t.is_featured && (
                      <span className="flex items-center gap-0.5 text-label text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400" /> Featured
                      </span>
                    )}

                    {/* Approval status */}
                    {t.is_approved
                      ? <span className="text-label text-green-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Approved</span>
                      : <span className="text-label text-amber-600 flex items-center gap-0.5"><Clock className="w-3 h-3" />Pending</span>
                    }
                  </div>

                  <p className="text-body-sm text-text-gray line-clamp-2">{t.content}</p>

                  {t.service_title && (
                    <p className="text-label text-text-gray mt-0.5 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {t.service_title}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <AdminBtn
                    variant="ghost" size="sm"
                    onClick={() => toggleApproval(t)}
                    title={t.is_approved ? 'Unapprove' : 'Approve'}
                  >
                    {t.is_approved
                      ? <XCircle className="w-4 h-4 text-error" />
                      : <CheckCircle2 className="w-4 h-4 text-success" />
                    }
                  </AdminBtn>
                  <AdminBtn
                    variant="ghost" size="sm"
                    onClick={() => toggleVerified(t)}
                    title={t.is_verified ? 'Remove verification' : 'Mark verified'}
                  >
                    <BadgeCheck className={cn('w-4 h-4', t.is_verified ? 'text-teal-600' : 'text-text-gray')} />
                  </AdminBtn>
                  <AdminBtn
                    variant="ghost" size="sm"
                    onClick={() => toggleFeatured(t)}
                    title={t.is_featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className={cn('w-4 h-4', t.is_featured ? 'fill-amber-400 text-amber-400' : 'text-text-gray')} />
                  </AdminBtn>
                  <AdminBtn
                    variant="ghost" size="sm"
                    onClick={() => setDeleting(t)}
                    className="hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </AdminBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <ConfirmDialog
        open={!!deleting}
        title="Delete testimonial?"
        message={`Remove testimonial from ${deleting?.author_name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        danger
      />

      <AnimatePresence>
        {showImport && (
          <ImportModal
            onClose={() => setShowImport(false)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
