import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.integ-test.ts'],
    setupFiles: ['dotenv/config', './src/test.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.integ-test.ts',
        'src/index.ts',
        'src/test.setup.ts',
        'src/__fixtures__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
