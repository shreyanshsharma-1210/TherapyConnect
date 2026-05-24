import React from 'react';
import { supabase } from '@/lib/supabase';
import { subscriptionRegistry } from './subscriptionRegistry';
import { cacheInvalidation } from './cacheInvalidation';
import { emitRealtimeEvent } from './realtimeEvents';
import { reconnectHandler } from './reconnectHandler';

// Debounce utility to prevent high-frequency UI updates or duplicate triggers
function debounce(fn, delay = 150) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

class RealtimeManager {
  constructor() {
    this.reconnectHandler = reconnectHandler; // Initialized connection recovery
  }

  // Centralized subscription mechanism
  subscribe(table, config = {}) {
    const {
      filter = null,
      onInsert = null,
      onUpdate = null,
      onDelete = null,
      onError = null
    } = config;

    const channelName = `realtime:${table}:${filter || 'all'}`;

    return subscriptionRegistry.getChannel(channelName, () => {
      const channel = supabase.channel(channelName);
      
      const realtimeConfig = { schema: 'public', table };
      if (filter) {
        realtimeConfig.filter = filter;
      }

      // Debounce events to prevent browser paint throttling or multiple duplicate payloads
      const handlePayload = debounce((payload) => {
        try {
          console.log(`[RealtimeManager] Received live event ${payload.eventType} on ${table}`, payload);

          // 1. Emit live payload to local event brokers/listeners
          emitRealtimeEvent(`${table}:${payload.eventType.toLowerCase()}`, payload);

          // 2. Automatically invalidate cache so queries know they are stale
          cacheInvalidation.invalidateTable(table);

          // 3. Fire custom callbacks
          if (payload.eventType === 'INSERT') {
            onInsert?.(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            onUpdate?.(payload.new, payload.old);
          } else if (payload.eventType === 'DELETE') {
            onDelete?.(payload.old);
          }
        } catch (err) {
          console.error(`[RealtimeManager] Error in ${table} subscriber callback:`, err);
          onError?.(err);
        }
      }, 150);

      channel.on('postgres_changes', realtimeConfig, handlePayload);

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[RealtimeManager] Successfully listening to: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[RealtimeManager] Connection error in: ${channelName}`);
          onError?.(new Error(`Failed to subscribe to channel: ${channelName}`));
        }
      });

      return channel;
    });
  }

  unsubscribe(table, filter = null) {
    let channelName;
    if (typeof table === 'string' && table.startsWith('realtime:')) {
      channelName = table;
    } else {
      channelName = `realtime:${table}:${filter || 'all'}`;
    }
    subscriptionRegistry.releaseChannel(channelName);
  }

  unsubscribeAll() {
    subscriptionRegistry.releaseAll();
  }
}

export const realtimeManager = new RealtimeManager();

// Standardized hook for components to subscribe cleanly
export function useRealtimeSubscription(table, config = {}) {
  const { filter, onInsert, onUpdate, onDelete, onError } = config;

  // React hooks
  React.useEffect(() => {
    const channel = realtimeManager.subscribe(table, {
      filter,
      onInsert,
      onUpdate,
      onDelete,
      onError
    });

    return () => {
      realtimeManager.unsubscribe(table, filter);
    };
  }, [table, filter, onInsert, onUpdate, onDelete, onError]);
}
