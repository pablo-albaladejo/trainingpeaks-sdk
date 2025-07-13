import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.integ-test.ts'],
    exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    testTimeout: 60000, // 60 seconds for integration tests
    hookTimeout: 30000, // 30 seconds for setup/teardown
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Run integration tests sequentially
      },
    },
    setupFiles: ['src/test.setup.ts'],
    env: {
      NODE_ENV: 'test',
    },
  },
});
