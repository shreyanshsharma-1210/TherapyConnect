import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth }    from '@/context/AuthContext';
import AuthLayout    from '@/components/auth/AuthLayout';
import AuthField     from '@/components/auth/AuthField';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { signIn, isAdmin } = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();
  const from                = location.state?.from || null;
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const result = await signIn(data);
      const role   = result?.profile?.role;
      console.log('[Login] Sign-in result:', { result, role, from });
      if (from && !from.startsWith('/auth')) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[Login] Sign-in error:', err);
      setServerError(err.message || 'Invalid email or password.');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your sessions and wellbeing"
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

        <AuthField
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-label text-teal-600 hover:text-teal-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-body-sm text-text-gray mt-2">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
