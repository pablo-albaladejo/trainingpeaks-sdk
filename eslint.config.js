import eslintPluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      // Disable base rule as it can conflict with TypeScript-specific rule
      'no-unused-vars': 'off',
      // Use TypeScript-specific rule instead
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-unresolved': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
  }
);
