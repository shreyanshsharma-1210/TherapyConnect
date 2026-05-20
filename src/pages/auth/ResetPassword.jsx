import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase }  from '@/lib/supabase';
import AuthLayout   from '@/components/auth/AuthLayout';
import AuthField    from '@/components/auth/AuthField';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

export default function ResetPassword() {
  const navigate      = useNavigate();
  const [ready,        setReady]        = useState(false);
  const [done,         setDone]         = useState(false);
  const [serverError,  setServerError]  = useState('');

  useEffect(() => {
    // Supabase sends the token in the URL hash; getSession picks it up automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
      if (!session) setServerError('Invalid or expired reset link. Please request a new one.');
    });
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    setServerError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setServerError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/auth/login'), 2500);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now sign in with your new password">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <p className="text-body text-text-gray">Redirecting you to sign in…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password">
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
          disabled={!ready}
          {...register('password')}
        />

        <AuthField
          label="Confirm new password"
          type="password"
          icon={Lock}
          placeholder="Repeat new password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          disabled={!ready}
          {...register('confirm')}
        />

        <button
          type="submit"
          disabled={isSubmitting || !ready}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
