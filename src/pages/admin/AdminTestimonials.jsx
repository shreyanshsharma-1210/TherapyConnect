import { useEffect, useState, useCallback } from 'react';
import { Trash2, Star, CheckCircle2, XCircle } from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { useToast }        from '@/context/ToastContext';
import {
  PageHeader, AdminCard, AdminBtn, ConfirmDialog, EmptyState,
} from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const FILTER_OPTIONS = ['all', 'approved', 'pending'];

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn('w-3 h-3', i <= rating ? 'fill-amber-400 text-amber-400' : 'text-border-light')} />
      ))}
    </div>
  );
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [deleting,     setDeleting]     = useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { setTestimonials(await adminRepository.getAllTestimonials()); }
    catch { toast({ type: 'error', title: 'Failed to load testimonials' }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('admin_testimonials')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'testimonials'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTestimonials(prev => {
            if (prev.some(t => t.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTestimonials(prev => {
            if (payload.new.deleted_at) {
              return prev.filter(t => t.id !== payload.new.id);
            }
            return prev.map(t => t.id === payload.new.id ? payload.new : t);
          });
        } else if (payload.eventType === 'DELETE') {
          setTestimonials(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const filtered = testimonials.filter(t => {
    if (filter === 'approved') return t.is_approved;
    if (filter === 'pending')  return !t.is_approved;
    return true;
  });

  const toggleApproval = async (t) => {
    try {
      const updated = await adminRepository.upsertTestimonial({ id: t.id, is_approved: !t.is_approved });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_approved: updated.is_approved } : x));
      toast({ type: 'success', title: updated.is_approved ? 'Approved' : 'Approval removed' });
    } catch { toast({ type: 'error', title: 'Failed to update' }); }
  };

  const toggleFeatured = async (t) => {
    try {
      const updated = await adminRepository.upsertTestimonial({ id: t.id, is_featured: !t.is_featured });
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, is_featured: updated.is_featured } : x));
      toast({ type: 'success', title: updated.is_featured ? 'Marked featured' : 'Removed from featured' });
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
        subtitle={`${testimonials.filter(t => !t.is_approved).length} pending review · review and approve user-submitted testimonials`}
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
            message="User-submitted testimonials will appear here for review."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border-light">
            {filtered.map((t) => (
              <div key={t.id} className="py-4 flex items-start gap-4">
                {/* Avatar */}
                {t.author_avatar ? (
                  <img src={t.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5 border border-border-light" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0 mt-0.5">
                    {t.author_name?.[0]}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-body-sm font-semibold text-text-dark">{t.author_name}</p>
                    {t.author_role && <p className="text-label text-text-gray">· {t.author_role}</p>}
                    <StarRating rating={t.rating} />
                    {t.is_featured && <span className="text-label text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400" />Featured</span>}
                    {t.is_approved
                      ? <span className="text-label text-green-600 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />Approved</span>
                      : <span className="text-label text-amber-600 flex items-center gap-0.5"><XCircle className="w-3 h-3" />Pending</span>
                    }
                  </div>
                  <p className="text-body-sm text-text-gray line-clamp-2">{t.content}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <AdminBtn variant="ghost" size="sm" onClick={() => toggleApproval(t)} title={t.is_approved ? 'Unapprove' : 'Approve'}>
                    {t.is_approved ? <XCircle className="w-4 h-4 text-error" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                  </AdminBtn>
                  <AdminBtn variant="ghost" size="sm" onClick={() => toggleFeatured(t)} title={t.is_featured ? 'Unfeature' : 'Feature'}>
                    <Star className={cn('w-4 h-4', t.is_featured ? 'fill-amber-400 text-amber-400' : 'text-text-gray')} />
                  </AdminBtn>
                  <AdminBtn variant="ghost" size="sm" onClick={() => setDeleting(t)} className="hover:text-error">
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
    </div>
  );
}
