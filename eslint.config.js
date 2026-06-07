import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': ['error', { printWidth: 100 }],
    },
  },
  {
    // Ignores
    ignores: ['node_modules/', 'dist/', '*.zip', 'src/**/*.html', 'src/**/*.css'],
  },
  {
    // Specific overrides for non-essential files
    files: ['*.html', '*.css', '.github/**/*'],
    rules: {
      'prettier/prettier': 'off',
    },
  },
  {
    // Test overrides
    files: ['tests/**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },
];
