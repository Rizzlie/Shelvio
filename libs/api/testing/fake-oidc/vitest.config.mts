import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../../node_modules/.vite/libs/api/testing/fake-oidc',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'api-testing-fake-oidc',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../../coverage/libs/api/testing/fake-oidc',
      provider: 'v8' as const,
    },
  },
}));
