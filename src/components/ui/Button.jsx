import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'inline-flex items-center justify-center gap-2 px-8 py-3 bg-error text-white font-semibold text-base rounded-btn min-h-[48px] transition-all duration-300 hover:bg-red-700',
};

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: '',
  lg: 'px-10 py-4 text-lg min-h-[56px]',
};

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon: Icon,
    iconPosition = 'left',
    className,
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const MotionComponent = typeof Component === 'string' ? motion[Component] : motion(Component);

  return (
    <MotionComponent
      ref={ref}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={cn(
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="h-4 w-4" aria-hidden="true" />
      )}
    </MotionComponent>
  );
});

export default Button;
