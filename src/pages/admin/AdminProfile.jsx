import { useEffect, useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';
import { useInvalidation, keys } from '@/lib/invalidationManager';
import { useRealtimeSubscription } from '@/lib/realtime/realtimeManager';
import {
  PageHeader, AdminCard, AdminBtn, AdminInput, AdminTextarea,
} from '@/components/admin/AdminComponents';

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput('');
  };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-label text-text-dark font-semibold">{label}</p>}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border-light bg-off-white min-h-[48px]">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-0.5 text-label font-semibold">
            {v}
            <button type="button" onClick={() => remove(i)} className="hover:text-error transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-body-sm text-text-dark placeholder:text-text-gray"
        />
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [form,     setForm]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const fileRef = useRef();
  const { toast } = useToast();

  // Admin Account Auth Email Update State
  const [newAuthEmail, setNewAuthEmail] = useState('');
  const [authEmailEditing, setAuthEmailEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  const load = useCallback(() => {
    adminRepository.getProfile().then(p => {
      setProfile(p);
      setForm(p ? { ...p } : null);
    }).finally(() => setLoading(false));
  }, []);

  // Centralized realtime subscription for therapist profile updates
  useRealtimeSubscription('therapist_profile');

  // Trigger invalidation state reload
  useInvalidation(keys.THERAPIST_PROFILE, load);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminRepository.uploadProfileImage(file);
      set('profile_image', url);
      toast({ type: 'success', title: 'Photo uploaded' });
    } catch {
      toast({ type: 'error', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const updated = await adminRepository.updateProfile(profile.id, form);
      setProfile(updated);
      toast({ type: 'success', title: 'Profile saved', message: 'Changes are live on the public site.' });
    } catch {
      toast({ type: 'error', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleAuthEmailChange = async (e) => {
    e.preventDefault();
    setEmailError('');
    if (!currentPassword) {
      setEmailError('Password is required.');
      return;
    }
    
    setEmailSaving(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      if (authError) throw new Error('Incorrect password.');

      const { error: updateError } = await supabase.auth.updateUser({ email: newAuthEmail });
      if (updateError) throw updateError;
      
      await updateAuthProfile({ email: newAuthEmail });
      toast({ type: 'success', title: 'Login Email Updated', message: 'Check your inbox for verification.' });
      
      setPasswordModalOpen(false);
      setAuthEmailEditing(false);
      setCurrentPassword('');
      setNewAuthEmail('');
    } catch (err) {
      setEmailError(err.message || 'Failed to change login email.');
    } finally {
      setEmailSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Profile" subtitle="Manage your public therapist profile" />
        <div className="h-64 rounded-2xl bg-cream-50 animate-pulse" />
      </div>
    );
  }

  if (!form) return <p className="text-text-gray">No profile found.</p>;

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Changes are reflected immediately on the public site"
        action={
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-body-sm text-teal-600 hover:text-teal-700">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </a>
            <AdminBtn variant="primary" onClick={handleSave} loading={saving}>
              Save Changes
            </AdminBtn>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div className="flex flex-col gap-5">
          <AdminCard title="Admin Login Account">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-off-white border border-border-light rounded-xl">
                <div>
                  <p className="text-label text-text-gray font-semibold mb-1">Login Email Address</p>
                  {authEmailEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="email"
                        value={newAuthEmail}
                        onChange={(e) => setNewAuthEmail(e.target.value)}
                        placeholder="New admin email"
                        className="px-3 py-1.5 rounded-lg border border-border-light text-body-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                      <button 
                        onClick={() => {
                          if(!newAuthEmail || newAuthEmail === user.email) return;
                          setPasswordModalOpen(true);
                        }}
                        disabled={!newAuthEmail || newAuthEmail === user.email}
                        className="bg-teal-600 text-white text-body-sm font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        Verify & Save
                      </button>
                      <button onClick={() => { setAuthEmailEditing(false); setNewAuthEmail(''); }} className="text-body-sm text-text-gray hover:underline px-2">Cancel</button>
                    </div>
                  ) : (
                    <p className="text-body-sm text-text-dark font-medium">{user?.email}</p>
                  )}
                </div>
                {!authEmailEditing && (
                  <button onClick={() => setAuthEmailEditing(true)} className="text-teal-600 hover:text-teal-700 text-body-sm font-semibold">Change Login Email</button>
                )}
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Basic Information">
            <div className="flex flex-col gap-4">
              <AdminInput label="Full name" value={form.full_name || ''} onChange={e => set('full_name', e.target.value)} />
              <AdminInput label="Professional title" value={form.title || ''} onChange={e => set('title', e.target.value)} />
              <AdminInput label="Years of experience" type="number" value={form.experience_years || 0} onChange={e => set('experience_years', Number(e.target.value))} />
              <AdminTextarea label="Short bio (homepage)" value={form.short_bio || ''} onChange={e => set('short_bio', e.target.value)} className="min-h-[80px]" />
              <AdminTextarea label="Full bio (about section)" value={form.bio || ''} onChange={e => set('bio', e.target.value)} className="min-h-[140px]" />
            </div>
          </AdminCard>

          <AdminCard title="CTA Messaging">
            <div className="flex flex-col gap-4">
              <AdminInput label="CTA headline" value={form.cta_headline || ''} onChange={e => set('cta_headline', e.target.value)} />
              <AdminTextarea label="CTA subtext" value={form.cta_subtext || ''} onChange={e => set('cta_subtext', e.target.value)} className="min-h-[80px]" />
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_accepting_clients ?? true} onChange={e => set('is_accepting_clients', e.target.checked)} className="w-4 h-4 accent-teal-600" />
                <span className="text-body-sm text-text-dark font-semibold">Currently accepting new clients</span>
              </label>
            </div>
          </AdminCard>

          <AdminCard title="Specialties & Credentials">
            <div className="flex flex-col gap-4">
              <TagInput label="Specialties" values={form.specialties || []} onChange={v => set('specialties', v)} placeholder="e.g. Anxiety" />
              <TagInput label="Credentials" values={form.credentials || []} onChange={v => set('credentials', v)} placeholder="e.g. M.Phil Psychology" />
              <TagInput label="Languages" values={form.languages || []} onChange={v => set('languages', v)} placeholder="e.g. English" />
            </div>
          </AdminCard>

          <AdminCard title="Contact & Social">
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="Public Contact Email" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
              <AdminInput label="Phone" type="tel" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
              <AdminInput label="WhatsApp" value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} />
              <AdminInput label="Session fee (₹)" type="number" value={form.session_fee_inr || 0} onChange={e => set('session_fee_inr', Number(e.target.value))} />
              <AdminInput label="Instagram URL" value={form.instagram_url || ''} onChange={e => set('instagram_url', e.target.value)} />
              <AdminInput label="LinkedIn URL" value={form.linkedin_url || ''} onChange={e => set('linkedin_url', e.target.value)} />
            </div>
          </AdminCard>
        </div>

        {/* Profile image */}
        <div className="flex flex-col gap-4">
          <AdminCard title="Profile Photo">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files?.[0])} />
            <div className="flex flex-col items-center gap-4">
              {form.profile_image ? (
                <div className="relative">
                  <img
                    src={form.profile_image}
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover border-4 border-teal-100 shadow-level-2"
                  />
                  <button
                    onClick={() => set('profile_image', '')}
                    className="absolute top-0 right-0 p-1.5 bg-white rounded-full shadow text-text-gray hover:text-error border border-border-light"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-teal-50 flex items-center justify-center border-4 border-teal-100">
                  <span className="font-display font-bold text-teal-600 text-4xl">
                    {form.full_name?.[0] || 'T'}
                  </span>
                </div>
              )}
              <AdminBtn
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                loading={uploading}
                className="w-full justify-center"
              >
                <Upload className="w-3.5 h-3.5" />
                {form.profile_image ? 'Change Photo' : 'Upload Photo'}
              </AdminBtn>
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Secure Password Verification Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-level-2">
            <h3 className="font-display font-bold text-xl text-text-dark mb-2">Verify Identity</h3>
            <p className="text-body-sm text-text-gray mb-4">Please enter your current password to confirm changing your admin login email to <span className="font-semibold text-text-dark">{newAuthEmail}</span>.</p>
            
            <form onSubmit={handleAuthEmailChange} className="flex flex-col gap-4">
              {emailError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 p-3 rounded-xl text-body-sm text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                required
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-off-white text-body focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
              />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setPasswordModalOpen(false); setCurrentPassword(''); setEmailError(''); }} className="flex-1 py-3 text-body-sm font-semibold text-text-gray border border-border-light rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={emailSaving} className="flex-1 py-3 text-body-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-70">
                  {emailSaving ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
