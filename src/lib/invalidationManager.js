// Centralized query invalidation and cache management system
// Coordinates data refresh across the application after mutations

class InvalidationManager {
  constructor() {
    this.listeners = new Map(); // key -> Set of callbacks
    this.keys = {
      BOOKINGS: 'bookings',
      PAYMENTS: 'payments',
      NOTIFICATIONS: 'notifications',
      BLOGS: 'blogs',
      TESTIMONIALS: 'testimonials',
      PROFILE: 'profile',
      AVAILABILITY: 'availability',
      SERVICES: 'services',
      THERAPIST_PROFILE: 'therapist_profile',
      COUPONS: 'coupons',
    };
  }

  // Subscribe to invalidation events for a specific key
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // Trigger invalidation for a key (or multiple keys)
  invalidate(...keys) {
    keys.forEach((key) => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            console.error(`[InvalidationManager] Error in callback for ${key}:`, err);
          }
        });
      }
    });
  }

  // Convenience methods for common invalidation patterns
  invalidateBookings() {
    this.invalidate(this.keys.BOOKINGS);
  }

  invalidatePayments() {
    this.invalidate(this.keys.PAYMENTS);
  }

  invalidateNotifications() {
    this.invalidate(this.keys.NOTIFICATIONS);
  }

  invalidateCMS() {
    this.invalidate(this.keys.BLOGS, this.keys.TESTIMONIALS, this.keys.SERVICES);
  }

  invalidateProfile() {
    this.invalidate(this.keys.PROFILE);
  }

  invalidateAll() {
    Object.values(this.keys).forEach((key) => this.invalidate(key));
  }
}

// Singleton instance
export const invalidationManager = new InvalidationManager();
export const { keys } = invalidationManager;

// React hook for subscribing to invalidations
import { useEffect } from 'react';

export function useInvalidation(key, callback) {
  useEffect(() => {
    return invalidationManager.subscribe(key, callback);
  }, [key, callback]);
}
