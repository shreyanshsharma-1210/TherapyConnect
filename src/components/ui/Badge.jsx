import { cn } from '@/lib/utils';

const variants = {
  primary:   'bg-coral-50 text-coral-600 border border-coral-200',
  secondary: 'bg-cream text-text-dark border border-cream-300',
  coral:     'bg-coral-50 text-coral-500 border border-coral-200',
  success:   'bg-green-50 text-success border border-green-200',
  warning:   'bg-yellow-50 text-warning border border-yellow-200',
  error:     'bg-red-50 text-error border border-red-200',
  neutral:   'bg-gray-100 text-text-gray border border-border-light',
};

function Badge({ children, variant = 'primary', className, ...props }) {
  return (
    <span
      className={cn('badge text-label', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
