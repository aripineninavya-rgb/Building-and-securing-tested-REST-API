import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8'
    },
    setupFiles: ['./src/__tests__/setup.js']
  }
});
