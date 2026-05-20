import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Video, MapPin, PhoneCall, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/hooks/useBooking';
import { useToast }   from '@/context/ToastContext';
import { useAuth }    from '@/context/AuthContext';
import { services } from '@/data/servicesData';

const schema = z.object({
  name:        z.string().min(2, 'At least 2 characters').max(50),
  email:       z.string().email('Enter a valid email'),
  phone:       z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile'),
  sessionType: z.string().min(1, 'Select a service'),
  mode:        z.enum(['Video Call', 'In-Person', 'Phone Call']),
  reason:      z.string().min(10, 'Min 10 characters').max(500),
  notes:       z.string().max(300).optional(),
});

const modes = [
  { value: 'Video Call', label: 'Video Call',  Icon: Video     },
  { value: 'In-Person',  label: 'In-Person',   Icon: MapPin    },
  { value: 'Phone Call', label: 'Phone Call',  Icon: PhoneCall },
];

function FieldWrapper({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label font-semibold text-text-dark tracking-wide">
        {label}
        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-label text-error flex items-center gap-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingForm() {
  const { formData, setFormData, submitBooking, isSubmitting, prevStep, selectedService } = useBooking();
  const { toast }    = useToast();
  const { profile }  = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...formData,
      sessionType: selectedService?.id || formData.sessionType || '',
      mode: formData.mode || 'Video Call',
    },
  });

  const watchedMode = watch('mode');

  // Autofill from profile whenever profile loads/updates
  useEffect(() => {
    if (!profile) return;
    if (profile.full_name)  setValue('name',  profile.full_name,  { shouldValidate: false });
    if (profile.email)      setValue('email', profile.email,      { shouldValidate: false });
    if (profile.phone)      setValue('phone', profile.phone,      { shouldValidate: false });
  }, [profile, setValue]);

  // Sync form changes back to context
  useEffect(() => {
    const sub = watch((data) => setFormData((prev) => ({ ...prev, ...data })));
    return () => sub.unsubscribe();
  }, [watch, setFormData]);

  const onSubmit = async (data) => {
    try {
      await submitBooking(data, profile?.id ?? null);
      toast({ type: 'success', title: 'Booking Confirmed!', message: 'We\'ll send you a confirmation email shortly.' });
    } catch (err) {
      console.error('[BookingForm.onSubmit] Booking failed:', err);
      toast({ type: 'error', title: 'Something went wrong', message: err?.message || 'Please try again.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldWrapper label="Full Name" required error={errors.name?.message}>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray" aria-hidden="true" />
            <input
              {...register('name')}
              type="text"
              placeholder="Your full name"
              className={cn('input-field pl-10', errors.name && 'input-error')}
              aria-invalid={!!errors.name}
            />
          </div>
        </FieldWrapper>

        <FieldWrapper label="Email Address" required error={errors.email?.message}>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray" aria-hidden="true" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={cn('input-field pl-10', errors.email && 'input-error')}
              aria-invalid={!!errors.email}
            />
          </div>
        </FieldWrapper>
      </div>

      {/* Phone */}
      <FieldWrapper label="Mobile Number" required error={errors.phone?.message}>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray" aria-hidden="true" />
          <input
            {...register('phone')}
            type="tel"
            placeholder="10-digit mobile number"
            className={cn('input-field pl-10', errors.phone && 'input-error')}
            aria-invalid={!!errors.phone}
          />
        </div>
      </FieldWrapper>

      {/* Service */}
      <FieldWrapper label="Service" required error={errors.sessionType?.message}>
        <div className="relative">
          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray" aria-hidden="true" />
          <select
            {...register('sessionType')}
            className={cn('input-field pl-10 cursor-pointer', errors.sessionType && 'input-error')}
            aria-invalid={!!errors.sessionType}
          >
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title} — {s.duration}</option>
            ))}
          </select>
        </div>
      </FieldWrapper>

      {/* Session mode */}
      <FieldWrapper label="Preferred Mode" required error={errors.mode?.message}>
        <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="Select session mode">
          {modes.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('mode', value, { shouldValidate: true })}
              className={cn(
                'flex-1 flex flex-row sm:flex-col items-center justify-center gap-2 py-3.5 rounded-xl border text-body-sm sm:text-label font-semibold transition-all duration-200',
                watchedMode === value
                  ? 'bg-coral text-white border-coral shadow-coral'
                  : 'bg-white text-text-gray border-border-light hover:border-coral hover:text-coral'
              )}
              aria-pressed={watchedMode === value}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {/* Reason */}
      <FieldWrapper label="Reason for Seeking Therapy" required error={errors.reason?.message}>
        <textarea
          {...register('reason')}
          rows={3}
          placeholder="Briefly describe what you'd like to work on…"
          className={cn('input-field resize-none', errors.reason && 'input-error')}
          aria-invalid={!!errors.reason}
        />
        <span className="text-label text-text-gray text-right">{watch('reason')?.length || 0}/500</span>
      </FieldWrapper>

      {/* Notes */}
      <FieldWrapper label="Additional Notes (optional)" error={errors.notes?.message}>
        <div className="relative">
          <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-text-gray" aria-hidden="true" />
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Any preferences, questions, or context…"
            className={cn('input-field pl-10 resize-none', errors.notes && 'input-error')}
          />
        </div>
      </FieldWrapper>

      {/* Privacy note */}
      <p className="text-label text-text-gray text-center">
        🔒 Your information is 100% confidential and never shared.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl border border-border-light text-text-dark font-semibold text-body-sm hover:border-coral hover:text-coral transition-all duration-200 disabled:opacity-50"
        >
          ← Back
        </button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={!isSubmitting ? { scale: 0.97 } : {}}
          className={cn(
            'flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-body-sm transition-all duration-200',
            isSubmitting
              ? 'bg-coral-400 text-white cursor-wait'
              : 'bg-coral text-white hover:bg-coral-600 shadow-coral'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Confirming Booking…
            </>
          ) : (
            'Confirm Booking →'
          )}
        </motion.button>
      </div>
    </form>
  );
}

export default BookingForm;
