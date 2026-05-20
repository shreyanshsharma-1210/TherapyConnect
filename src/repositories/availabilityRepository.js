import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const availabilityRepository = {
  async getRange(startDate, endDate) {
    return query(
      supabase
        .from('therapist_availability')
        .select('available_date, level, max_slots, booked_slots')
        .gte('available_date', startDate)
        .lte('available_date', endDate)
        .order('available_date', { ascending: true })
    );
  },

  async getForMonth(year, month) {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end   = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    return this.getRange(start, end);
  },
};
