import { supabase } from '@/lib/supabase';

class SubscriptionRegistry {
  constructor() {
    this.channels = new Map(); // channelName -> Channel object
    this.refCounts = new Map(); // channelName -> active subscription count
  }

  getChannel(channelName, createFn) {
    if (this.channels.has(channelName)) {
      const currentCount = this.refCounts.get(channelName) || 0;
      this.refCounts.set(channelName, currentCount + 1);
      console.log(`[SubscriptionRegistry] Reusing existing channel: ${channelName} (ref count: ${currentCount + 1})`);
      return this.channels.get(channelName);
    }

    console.log(`[SubscriptionRegistry] Creating new channel: ${channelName}`);
    const channel = createFn();
    this.channels.set(channelName, channel);
    this.refCounts.set(channelName, 1);
    return channel;
  }

  releaseChannel(channelName) {
    if (!this.channels.has(channelName)) return;

    const currentCount = this.refCounts.get(channelName) || 0;
    const nextCount = currentCount - 1;

    if (nextCount <= 0) {
      console.log(`[SubscriptionRegistry] Tearing down inactive channel: ${channelName}`);
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
      }
      this.channels.delete(channelName);
      this.refCounts.delete(channelName);
    } else {
      this.refCounts.set(channelName, nextCount);
      console.log(`[SubscriptionRegistry] Decreased reference count for: ${channelName} (ref count: ${nextCount})`);
    }
  }

  releaseAll() {
    console.log('[SubscriptionRegistry] Releasing all active channels');
    this.channels.forEach((channel) => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error('[SubscriptionRegistry] Error removing channel:', err);
      }
    });
    this.channels.clear();
    this.refCounts.clear();
  }
}

export const subscriptionRegistry = new SubscriptionRegistry();
