/**
 * Centralised API error handling.
 * Wraps Supabase errors into consistent shape for the UI layer.
 */

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name  = 'ApiError';
    this.code  = code  || 'UNKNOWN';
    this.status = status || 500;
  }
}

/**
 * Execute a Supabase query and throw ApiError on failure.
 * Usage: const data = await query(supabase.from('table').select('*'));
 */
export async function query(promise) {
  const { data, error } = await promise;
  if (error) throw new ApiError(error.message, error.code, error.status ?? 500);
  return data;
}

/**
 * Map common Supabase/Postgres error codes to user-friendly messages.
 */
export function friendlyError(err) {
  if (!err) return 'An unexpected error occurred.';
  const msg = err.message || '';
  if (err.code === 'PGRST116')   return 'Record not found.';
  if (err.code === '23505')      return 'This record already exists.';
  if (err.code === '23503')      return 'Referenced record does not exist.';
  if (err.code === '42501')      return 'You do not have permission to perform this action.';
  if (msg.includes('JWT'))       return 'Your session has expired. Please sign in again.';
  if (msg.includes('duplicate')) return 'This entry already exists.';
  return msg || 'Something went wrong. Please try again.';
}
