import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-bold text-h3 text-text-dark">{title}</h1>
        {subtitle && <p className="text-body-sm text-text-gray mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'teal', trend, loading }) {
  const colors = {
    teal:   'bg-teal-50   text-teal-700   border-teal-100',
    coral:  'bg-coral-50  text-coral      border-coral-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    amber:  'bg-amber-50  text-amber-700  border-amber-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-border-light shadow-level-1 p-5 flex items-center gap-4 min-w-0">
      {Icon && (
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border shrink-0', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-label text-text-gray uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <div className="h-8 bg-cream-50 rounded mt-1 mb-1 animate-pulse" />
        ) : (
          <p className="font-display font-bold text-h4 xl:text-h3 text-text-dark leading-none mt-1 break-words">{value}</p>
        )}
        {trend && <p className="text-label text-text-gray mt-1 truncate">{trend}</p>}
      </div>
    </div>
  );
}

export function AdminCard({ title, children, action, className }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-border-light shadow-level-1 overflow-hidden', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
          {title && <h2 className="font-body font-bold text-text-dark">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cfg = {
    confirmed:   'bg-green-50  text-green-700  border-green-200',
    pending:     'bg-amber-50  text-amber-700  border-amber-200',
    cancelled:   'bg-red-50    text-red-600    border-red-200',
    completed:   'bg-teal-50   text-teal-700   border-teal-200',
    rescheduled: 'bg-blue-50   text-blue-700   border-blue-200',
    no_show:     'bg-gray-50   text-gray-600   border-gray-200',
    published:   'bg-green-50  text-green-700  border-green-200',
    draft:       'bg-amber-50  text-amber-700  border-amber-200',
    archived:    'bg-gray-50   text-gray-500   border-gray-200',
    approved:    'bg-green-50  text-green-700  border-green-200',
    pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-label border font-semibold capitalize',
      cfg[status] || 'bg-gray-50 text-gray-600 border-gray-200'
    )}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export function AdminBtn({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  const variants = {
    primary:  'bg-teal-600 hover:bg-teal-700 text-white shadow-level-1',
    secondary:'bg-white hover:bg-cream-50 text-text-dark border border-border-light',
    danger:   'bg-red-50 hover:bg-red-100 text-error border border-red-200',
    ghost:    'text-text-gray hover:bg-cream-50 hover:text-text-dark',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-body-sm',
    md: 'px-4 py-2 text-body-sm',
    lg: 'px-5 py-2.5 text-body',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function AdminInput({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-label text-text-dark font-semibold">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl border border-border-light bg-off-white px-4 py-2.5 text-body text-text-dark',
          'placeholder:text-text-gray outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white',
          'disabled:opacity-50',
          error ? 'border-error focus:ring-error/20 focus:border-error' : '',
          className
        )}
        {...props}
      />
      {error && <p className="text-label text-error">{error}</p>}
    </div>
  );
}

export function AdminTextarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-label text-text-dark font-semibold">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-border-light bg-off-white px-4 py-2.5 text-body text-text-dark',
          'placeholder:text-text-gray outline-none transition-all duration-200 resize-y min-h-[100px]',
          'focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white',
          error ? 'border-error focus:ring-error/20 focus:border-error' : '',
          className
        )}
        {...props}
      />
      {error && <p className="text-label text-error">{error}</p>}
    </div>
  );
}

export function AdminSelect({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-label text-text-dark font-semibold">{label}</label>}
      <select
        className={cn(
          'w-full rounded-xl border border-border-light bg-off-white px-4 py-2.5 text-body text-text-dark',
          'outline-none transition-all duration-200 cursor-pointer',
          'focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-label text-error">{error}</p>}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
        <span className="text-2xl">🌿</span>
      </div>
      <p className="font-body font-bold text-text-dark mb-1">{title}</p>
      {message && <p className="text-body-sm text-text-gray mb-4">{message}</p>}
      {action}
    </div>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-level-3 p-6 max-w-sm w-full">
        <h3 className="font-body font-bold text-text-dark mb-2">{title}</h3>
        <p className="text-body-sm text-text-gray mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <AdminBtn variant="secondary" onClick={onCancel}>Cancel</AdminBtn>
          <AdminBtn
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            Confirm
          </AdminBtn>
        </div>
      </div>
    </div>
  );
}
