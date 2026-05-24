import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/apiError';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthField from '@/components/auth/AuthField';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      setServerError(friendlyError(err) || 'Failed to send reset link. Please try again.');
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a reset link">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <p className="text-body text-text-gray">
            If an account exists for that email, we've sent a password reset link. Please check your inbox.
          </p>
          <Link
            to="/auth/login"
            className="btn-primary w-full py-3 mt-2 block text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
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
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending link…</>
          ) : (
            'Send Reset Link'
          )}
        </button>

        <p className="text-center text-body-sm text-text-gray mt-2">
          Remembered your password?{' '}
          <Link to="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
