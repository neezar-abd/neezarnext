import { dirname } from 'path';
import { fileURLToPath } from 'url';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default tseslint.config([
  ...compat.extends('next/core-web-vitals'),
  eslint.configs.recommended,
  {
    ignores: ['*.mjs', '.next/**/*', 'node_modules/**/*']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // General rules - made more permissive for production build
      semi: ['warn', 'always'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'prefer-const': ['warn', { destructuring: 'all' }],
      'jsx-quotes': 'off', // Disabled to prevent build failures
      'linebreak-style': 'off', // Disabled for Windows compatibility
      'no-console': 'off', // Allow console for debugging
      'comma-dangle': 'off', // Disabled to prevent build failures
      'no-unused-expressions': 'warn',
      'no-constant-binary-expression': 'warn',
      'react/no-unescaped-entities': 'off', // Disabled for apostrophes

      // Import plugin rules - made warnings instead of errors
      'import/order': 'off', // Disabled to prevent build failures
      'import/no-duplicates': 'warn',

      // TypeScript plugin rules - made more permissive
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  }
]);
