import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      "no-unused-vars": "warn",
      "import/no-unresolved": "error",
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    }
  }
);
