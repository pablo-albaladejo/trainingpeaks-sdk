import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@adapters': resolve(__dirname, './src/adapters'),
      '@application': resolve(__dirname, './src/application'),
      '@domain': resolve(__dirname, './src/domain'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@fixtures': resolve(__dirname, './src/__fixtures__'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.integ-test.ts'],
    setupFiles: ['dotenv/config', './src/test.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportOnFailure: true,
      thresholds: {
        autoUpdate: true,
      },
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/**',
        'coverage/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.integ-test.ts',
        'src/index.ts',
        'src/test.setup.ts',
        'src/__fixtures__/**',
        '**/node_modules/**',
        '**/coverage/**',
        '**/dist*/**',
        '**/*.config.*',
        '**/*.config.js',
        '**/*.config.ts',
        '**/*.config.cjs',
        'scripts/**',
        'e2e-test/**',
      ],
    },
  },
});
