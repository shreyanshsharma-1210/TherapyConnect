import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth }  from '@/context/AuthContext';
import AuthLayout  from '@/components/auth/AuthLayout';
import AuthField   from '@/components/auth/AuthField';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

export default function Signup() {
  const { signUp }  = useAuth();
  const navigate    = useNavigate();
  const [success,     setSuccess]     = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await signUp({ email: data.email, password: data.password, fullName: data.fullName, phone: data.phone });
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Could not create account. Please try again.');
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Almost there!">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <p className="text-body text-text-gray">
            We've sent a confirmation link to your email. Click it to activate your account.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="btn-primary w-full py-3 mt-2"
          >
            Go to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your wellness journey today"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-body-sm text-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverError}
          </div>
        )}

        <AuthField
          label="Full name"
          type="text"
          icon={User}
          placeholder="Your full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <AuthField
          label="Mobile number"
          type="tel"
          icon={Phone}
          placeholder="10-digit mobile number"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <AuthField
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthField
          label="Password"
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
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-center text-body-sm text-text-gray mt-2">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
