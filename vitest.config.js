import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  ['./src/test/setup.js'],
    exclude:     ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.js'],
    include:     ['src/test/unit/**/*.test.{js,jsx,ts,tsx}'],
    css:         false,
    coverage: {
      provider:   'v8',
      reporter:   ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        'src/data/**',
        'dist/**',
        '*.config.*',
      ],
      thresholds: {
        statements: 60,
        branches:   50,
        functions:  60,
        lines:      60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
