/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

// Tests run in a zone ahead of UTC, so date-only tests catch a day shifted through UTC even on a
// UTC machine such as CI. Set here because test workers inherit it when they start.
process.env.TZ = 'Europe/Warsaw';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../../node_modules/.vite/libs/web/shared/formatting',
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [angular()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: 'web-shared-formatting',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../../coverage/libs/web/shared/formatting',
      provider: 'v8' as const,
    },
  },
}));
