import { availabilityRepository }    from '@/repositories/availabilityRepository';
import { availabilityData as static_ } from '@/data/availabilityData';

export const availabilityService = {
  /**
   * Returns a map of { 'YYYY-MM-DD': 'available' | 'limited' | 'unavailable' }
   * Falls back to static data if the DB call fails.
   */
  async getMonthMap(year, month) {
    try {
      const rows = await availabilityRepository.getForMonth(year, month);
      if (!rows || rows.length === 0) return static_;

      return rows.reduce((acc, row) => {
        acc[row.available_date] = row.level;
        return acc;
      }, {});
    } catch {
      return static_;
    }
  },
};
