import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from:      vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), single: vi.fn(), order: vi.fn(), limit: vi.fn() })),
    auth:      { getSession: vi.fn(), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })), signOut: vi.fn() },
    channel:   vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
    functions: { invoke: vi.fn(() => Promise.resolve({ data: {}, error: null })) },
  },
}));

// Mock analytics (no-op in tests)
vi.mock('@/lib/analytics', () => ({
  analytics:      new Proxy({}, { get: () => vi.fn() }),
  track:          vi.fn(),
  trackPage:      vi.fn(),
  identifyUser:   vi.fn(),
  resetUser:      vi.fn(),
  initAnalytics:  vi.fn(),
}));

// Mock monitoring
vi.mock('@/lib/monitoring', () => ({
  initMonitoring: vi.fn(),
  captureError:   vi.fn(),
  setSentryUser:  vi.fn(),
  clearSentryUser:vi.fn(),
  Sentry: {
    withErrorBoundary: (Component) => Component,
    withScope: vi.fn(),
    captureException: vi.fn(),
    setUser: vi.fn(),
    init: vi.fn(),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}));

// Suppress console.error in tests (keeps output clean)
const consoleError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    consoleError(...args);
  };
});
afterAll(() => { console.error = consoleError; });
