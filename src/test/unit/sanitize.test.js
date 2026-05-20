import { describe, it, expect } from 'vitest';
import { sanitizeText, truncate, sanitizePayload, isValidEmail, isValidPhone, validateUpload } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('strips script tags', () => {
    const input = 'Hello <script>alert("xss")</script> world';
    expect(sanitizeText(input)).not.toContain('<script>');
  });

  it('strips inline event handlers', () => {
    const input = '<img src="x" onerror="alert(1)">';
    expect(sanitizeText(input)).not.toContain('onerror');
  });

  it('strips javascript: URIs', () => {
    expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:');
  });

  it('passes clean text through unchanged', () => {
    const clean = 'Hello, I need therapy for anxiety.';
    expect(sanitizeText(clean)).toBe(clean);
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    const long = 'a'.repeat(2000);
    expect(truncate(long, 100).length).toBe(100);
  });

  it('passes short strings unchanged', () => {
    expect(truncate('short', 100)).toBe('short');
  });
});

describe('sanitizePayload', () => {
  it('sanitizes all string fields', () => {
    const payload = { name: 'John <script>', reason: 'Anxiety' };
    const clean   = sanitizePayload(payload);
    expect(clean.name).not.toContain('<script>');
    expect(clean.reason).toBe('Anxiety');
  });

  it('handles nested objects', () => {
    const payload = { a: { b: 'javascript:evil' } };
    expect(sanitizePayload(payload).a.b).not.toContain('javascript:');
  });

  it('preserves non-string values', () => {
    const payload = { count: 5, active: true, arr: [1, 2] };
    const clean   = sanitizePayload(payload);
    expect(clean.count).toBe(5);
    expect(clean.active).toBe(true);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.co.in')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid Indian phone numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('6543210987')).toBe(true);
  });

  it('rejects invalid numbers', () => {
    expect(isValidPhone('1234567890')).toBe(false);
    expect(isValidPhone('12345')).toBe(false);
  });

  it('accepts empty/null (optional field)', () => {
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone(null)).toBe(true);
  });
});

describe('validateUpload', () => {
  it('accepts valid image files', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });
    expect(validateUpload(file)).toHaveLength(0);
  });

  it('rejects oversized files', () => {
    const file = new File(['data'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 });
    const errors = validateUpload(file, { maxMB: 5 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects disallowed file types', () => {
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });
    expect(validateUpload(file).length).toBeGreaterThan(0);
  });
});
