import { supabase } from '@/lib/supabase';

// Debounce utility to prevent excessive updates
function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Centralized realtime subscription manager
// Prevents duplicate subscriptions, handles cleanup, provides unified API

class RealtimeManager {
  constructor() {
    this.subscriptions = new Map(); // channel -> subscription
    this.channels = new Map(); // channel name -> channel
  }

  // Subscribe to a table with optional filter
  subscribe(table, config = {}) {
    const { 
      filter = null, 
      onInsert = null, 
      onUpdate = null, 
      onDelete = null,
      onError = null 
    } = config;

    const channelName = `realtime:${table}:${filter || 'all'}`;

    // Return existing subscription if already active
    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName);
    }

    const channel = supabase.channel(channelName);

    // Build realtime config
    const realtimeConfig = { schema: 'public', table };
    if (filter) {
      realtimeConfig.filter = filter;
    }

    // Debounce handlers to prevent rapid-fire updates
    const debouncedInsert = onInsert ? debounce(onInsert, 100) : null;
    const debouncedUpdate = onUpdate ? debounce(onUpdate, 100) : null;
    const debouncedDelete = onDelete ? debounce(onDelete, 100) : null;

    channel
      .on('postgres_changes', realtimeConfig, (payload) => {
        try {
          switch (payload.eventType) {
            case 'INSERT':
              debouncedInsert?.(payload.new, payload.old);
              break;
            case 'UPDATE':
              debouncedUpdate?.(payload.new, payload.old);
              break;
            case 'DELETE':
              debouncedDelete?.(payload.old);
              break;
          }
        } catch (err) {
          console.error(`[RealtimeManager] Error in ${table} handler:`, err);
          onError?.(err);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeManager] Subscribed to ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[RealtimeManager] Channel error for ${table}`);
          onError?.(new Error('Channel subscription failed'));
        }
      });

    this.channels.set(channelName, channel);
    this.subscriptions.set(channelName, channel);

    return channel;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.subscriptions.delete(channelName);
      console.log(`[RealtimeManager] Unsubscribed from ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscriptions.clear();
    console.log('[RealtimeManager] Unsubscribed from all channels');
  }

  // Get active subscription count
  getActiveCount() {
    return this.subscriptions.size;
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();

// Convenience hooks for common subscriptions
export function useRealtimeSubscription(table, config = {}) {
  const { filter, onInsert, onUpdate, onDelete, onError } = config;

  React.useEffect(() => {
    const channel = realtimeManager.subscribe(table, { filter, onInsert, onUpdate, onDelete, onError });

    return () => {
      const channelName = `realtime:${table}:${filter || 'all'}`;
      realtimeManager.unsubscribe(channelName);
    };
  }, [table, filter]); // Re-subscribe if table or filter changes
}

// React import for the hook
import React from 'react';
