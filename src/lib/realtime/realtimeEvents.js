// Centralized Realtime Event Broker for decoupling realtime payloads from components
export const realtimeEvents = new EventTarget();

export function emitRealtimeEvent(type, payload) {
  try {
    const event = new CustomEvent(type, { detail: payload });
    realtimeEvents.dispatchEvent(event);
  } catch (err) {
    console.error(`[RealtimeEvents] Failed to emit event ${type}:`, err);
  }
}

export function useRealtimeEventListener(eventType, callback) {
  const React = require('react');
  
  React.useEffect(() => {
    const handler = (e) => callback(e.detail);
    realtimeEvents.addEventListener(eventType, handler);
    return () => {
      realtimeEvents.removeEventListener(eventType, handler);
    };
  }, [eventType, callback]);
}
