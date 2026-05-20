import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const AuthField = forwardRef(function AuthField(
  { label, error, type = 'text', icon: Icon, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-label text-text-dark font-semibold">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray pointer-events-none" />
        )}
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full rounded-xl border bg-off-white px-4 py-3 text-body text-text-dark placeholder:text-text-gray',
            'transition-all duration-200 outline-none',
            'focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            Icon ? 'pl-10' : '',
            isPassword ? 'pr-10' : '',
            error
              ? 'border-error focus:ring-error/20 focus:border-error'
              : 'border-border-light hover:border-teal-300'
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-gray hover:text-text-dark transition-colors"
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-label text-error">{error}</p>
      )}
    </div>
  );
});

export default AuthField;
