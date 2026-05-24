import { invalidationManager } from '@/lib/invalidationManager';
import { supabase } from '@/lib/supabase';

class ReconnectHandler {
  constructor() {
    this.isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    this.lastActive = Date.now();
    this.reconnectTimer = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    // Periodically check websocket status if needed
    this.checkWebsocketInterval = setInterval(() => {
      this.verifyConnection();
    }, 45000);
  }

  handleOnline() {
    console.log('[ReconnectHandler] Internet connection restored.');
    this.isOffline = false;
    this.recoverState();
  }

  handleOffline() {
    console.warn('[ReconnectHandler] Internet connection lost.');
    this.isOffline = true;
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      const idleDuration = Date.now() - this.lastActive;
      console.log(`[ReconnectHandler] Tab became visible. Idle duration: ${idleDuration}ms`);
      // If the tab was hidden for more than 15 seconds, force a full refresh of active caches
      if (idleDuration > 15000) {
        console.log('[ReconnectHandler] Recovering state after idle visibility change...');
        this.recoverState();
      }
    }
    this.lastActive = Date.now();
  }

  verifyConnection() {
    // If the socket connection to Supabase is broken, force reconnect on realtime channel
    if (this.isOffline) return;
    
    // Access internal realtime websocket client status if available
    const realtime = supabase.realtime;
    if (realtime && !realtime.isConnected()) {
      console.warn('[ReconnectHandler] Realtime WebSocket disconnected. Attempting reconnect...');
      realtime.connect();
    }
  }

  recoverState() {
    console.log('[ReconnectHandler] Triggering state reconciliation across all active subscribers.');
    // Trigger global invalidation to refetch all stale records/statistics
    invalidationManager.invalidateAll();
  }

  destroy() {
    if (typeof window === 'undefined') return;
    clearInterval(this.checkWebsocketInterval);
  }
}

export const reconnectHandler = new ReconnectHandler();
