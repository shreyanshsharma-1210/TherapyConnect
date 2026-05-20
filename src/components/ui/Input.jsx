import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required,
    id,
    className,
    containerClassName,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-label font-medium text-text-dark tracking-wide"
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        className={cn(
          'input-field',
          error && 'input-error',
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-body-sm text-text-gray">
          {helperText}
        </p>
      )}
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-body-sm text-error flex items-center gap-1"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
