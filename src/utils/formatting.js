export function formatCurrency(amount, currency = '₹') {
  if (amount >= 10000000) {
    return `${currency}${(amount / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  }
  if (amount >= 100000) {
    return `${currency}${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  return `${currency}${amount.toLocaleString('en-IN')}`;
}
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
    ...options,
  });
}

export function formatShortDate(dateStr) {
  return formatDate(dateStr, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function truncateText(text, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
