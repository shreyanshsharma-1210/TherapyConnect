import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';
import { useAuth }             from '@/context/AuthContext';
import { supabase }            from '@/lib/supabase';
import { realtimeManager }     from '@/lib/realtimeManager';
import { useInvalidation, keys } from '@/lib/invalidationManager';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationService.getForUser(user.id);
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch {
      // silently fail — non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reconnect & cross-tab stale-state recovery — catches missed pushes
  useInvalidation(keys.NOTIFICATIONS, load);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); setLoading(false); return; }

    // Realtime subscription for notifications
    const channel = realtimeManager.subscribe('notifications', {
      filter: `user_id=eq.${user.id}`,
      onInsert: (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        if (!newNotification.is_read) {
          setUnreadCount((prev) => prev + 1);
        }
      },
      onUpdate: (updatedNotification) => {
        setNotifications((prev) => {
          const oldNotification = prev.find((n) => n.id === updatedNotification.id);
          const oldWasUnread = oldNotification?.is_read === false;
          const newIsUnread = updatedNotification.is_read === false;
          
          setNotifications((p) => p.map((n) => n.id === updatedNotification.id ? updatedNotification : n));
          
          if (oldWasUnread && !newIsUnread) {
            setUnreadCount((c) => Math.max(0, c - 1));
          } else if (!oldWasUnread && newIsUnread) {
            setUnreadCount((c) => c + 1);
          }
          
          return prev;
        });
      },
    });

    return () => {
      realtimeManager.unsubscribe(`realtime:notifications:user_id=eq.${user.id}`);
    };
  }, [user]);

  const markRead = useCallback(async (id) => {
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markRead(id);
      // Realtime will handle the final state
    } catch (err) {
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      throw err;
    }
  }, [notifications, unreadCount]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllRead(user.id);
      // Realtime will handle the final state
    } catch (err) {
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      throw err;
    }
  }, [user, notifications, unreadCount]);

  return { notifications, loading, unreadCount, markRead, markAllRead, refresh: load };
}
