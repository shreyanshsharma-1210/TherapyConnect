import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const notificationRepository = {
  async getByUser(userId, { unreadOnly = false } = {}) {
    let q = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) q = q.eq('is_read', false);
    return query(q);
  },

  async markRead(id) {
    return query(
      supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
    );
  },

  async markAllRead(userId) {
    return query(
      supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)
    );
  },
};
