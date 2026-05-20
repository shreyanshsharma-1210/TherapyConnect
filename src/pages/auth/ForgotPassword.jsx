import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase }  from '@/lib/supabase';
import AuthLayout   from '@/components/auth/AuthLayout';
import AuthField    from '@/components/auth/AuthField';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export default function ForgotPassword() {
  const [sent,        setSent]        = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    setServerError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setServerError(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="Password reset link sent">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-teal-500" />
          </div>
          <p className="text-body text-text-gray">
            We've sent a password reset link. Check your inbox and follow the instructions.
          </p>
          <Link to="/auth/login" className="btn-primary w-full py-3 text-center mt-2">
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a reset link to your email"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </div>
        )}

        <AuthField
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            'Send Reset Link'
          )}
        </button>

        <Link
          to="/auth/login"
          className="text-center text-body-sm text-teal-600 hover:text-teal-700 transition-colors"
        >
          Back to Sign In
        </Link>
      </form>
    </AuthLayout>
  );
}
