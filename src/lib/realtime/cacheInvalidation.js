import { invalidationManager, keys } from '@/lib/invalidationManager';

export const cacheInvalidation = {
  invalidateTable(table) {
    console.log(`[CacheInvalidation] Invalidating cache due to changes in table: ${table}`);
    switch (table) {
      case 'blog_posts':
        invalidationManager.invalidate(keys.BLOGS);
        break;
      case 'testimonials':
        invalidationManager.invalidate(keys.TESTIMONIALS);
        break;
      case 'services':
        invalidationManager.invalidate(keys.SERVICES);
        break;
      case 'therapist_availability':
      case 'blocked_time_ranges':
      case 'therapist_vacations':
      case 'availability_rules':
        invalidationManager.invalidate(keys.AVAILABILITY);
        break;
      case 'therapist_profile':
        invalidationManager.invalidate(keys.THERAPIST_PROFILE);
        break;
      case 'bookings':
        invalidationManager.invalidate(keys.BOOKINGS);
        break;
      case 'payments':
        invalidationManager.invalidate(keys.PAYMENTS);
        break;
      case 'coupons':
        invalidationManager.invalidate(keys.COUPONS);
        break;
      default:
        console.warn(`[CacheInvalidation] Unknown table for invalidation: ${table}`);
        break;
    }
  }
};
