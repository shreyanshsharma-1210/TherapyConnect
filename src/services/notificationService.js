import { supabase }                from '@/lib/supabase';
import { notificationRepository } from '@/repositories/notificationRepository';
import { friendlyError }           from '@/lib/apiError';

export const notificationService = {
  async getForUser(userId) {
    try {
      return await notificationRepository.getByUser(userId);
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  async markRead(id) {
    try {
      return await notificationRepository.markRead(id);
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  async markAllRead(userId) {
    try {
      return await notificationRepository.markAllRead(userId);
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  },

  // Subscribe to real-time notifications for a user
  subscribeToUser(userId, onNew) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onNew(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};
