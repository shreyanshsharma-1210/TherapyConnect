/**
 * Input sanitization helpers — used on all user-facing text fields before DB writes.
 */

// Strip dangerous HTML/script content from strings
export function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '')
    .replace(/<[^>]*on\w+\s*=\s*["'][^"']*["'][^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
}

// Truncate to safe DB length
export function truncate(str, max = 1000) {
  if (typeof str !== 'string') return str;
  return str.slice(0, max);
}

// Sanitize an entire form payload object
export function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const clean = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      clean[key] = sanitizeText(truncate(value));
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizePayload(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// Safe email validation
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Safe phone validation (Indian)
export function isValidPhone(phone) {
  return !phone || /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

// Sanitize file upload — validate type + size
export function validateUpload(file, { maxMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = {}) {
  const errors = [];
  if (!file) return errors;
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Accepted: ${allowedTypes.join(', ')}`);
  }
  if (file.size > maxMB * 1024 * 1024) {
    errors.push(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${maxMB}MB`);
  }
  return errors;
}
