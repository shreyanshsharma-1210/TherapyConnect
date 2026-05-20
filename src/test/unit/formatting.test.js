import { describe, it, expect } from 'vitest';
import { formatCurrency, formatShortDate } from '@/utils/formatting';

describe('formatCurrency', () => {
  it('formats INR correctly', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('handles large amounts', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('1,00,000');
  });
});

describe('formatShortDate', () => {
  it('formats a valid date string', () => {
    const result = formatShortDate('2025-06-15');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns empty for invalid input', () => {
    expect(formatShortDate('')).toBeFalsy();
    expect(formatShortDate(null)).toBeFalsy();
  });
});
