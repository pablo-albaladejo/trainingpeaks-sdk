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
      // Naming convention: types must start with uppercase
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          custom: {
            regex: '^[A-Z]',
            match: true,
          },
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          custom: {
            regex: '^[A-Z]',
            match: true,
          },
        },
      ],
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
