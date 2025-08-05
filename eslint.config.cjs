// eslint.config.cjs - ESLint 9 Flat Config
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unusedImports = require('eslint-plugin-unused-imports');
const vitest = require('@vitest/eslint-plugin');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'dist-cjs/**'],
  },

  // Base configuration for TypeScript files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.test.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      vitest: vitest,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      ...typescriptEslint.configs['recommended-type-checked'].rules,
      ...vitest.configs.recommended.rules,

      'no-console': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/no-conditional-tests': 'error',
      'vitest/prefer-lowercase-title': ['error', { ignore: ['describe'] }],
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-strict-equal': 'off',
      'vitest/prefer-to-have-length': 'error',
      'vitest/require-top-level-describe': 'off',
    },
  },

  // Override for logging files
  {
    files: ['src/adapters/logging/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // Override for fixture files
  {
    files: ['**/__fixtures__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-index-signature': 'off',
      '@typescript-eslint/no-unsafe-property-access': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
    },
  },
];
