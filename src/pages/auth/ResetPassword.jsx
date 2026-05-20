import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthField from '@/components/auth/AuthField';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [serverError, setServerError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Optional: check if we have a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // sometimes the URL hash hasn't been parsed yet, supabase handles it automatically
      }
    });
  }, []);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) throw error;
      
      addToast({
        type: 'success',
        title: 'Password updated successfully',
        message: 'Your password has been changed. You can now log in.'
      });
      
      // Force sign out just to ensure clean state and prompt login with new password
      await supabase.auth.signOut();
      navigate('/auth/login', { replace: true });
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      setServerError(err.message || 'Failed to reset password. The link might be expired.');
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previous used passwords"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </div>
        )}

        <AuthField
          label="New password"
          type="password"
          icon={Lock}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <AuthField
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="Repeat your new password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Updating password…</>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
