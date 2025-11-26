// eslint.config.js
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    files: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}'],

    extends: [
      eslint.configs.recommended,
      // БЕЗ typed-linting:
      ...tseslint.configs.recommended,
      // Если хочешь — можешь добавить ещё react.configs.recommended
      // но это опционально
    ],

    plugins: {
      react,
      'react-hooks': reactHooks,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // ВАЖНО: НЕ указываем project / tsconfig — чтобы не требовать типовой анализ
      },
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-expressions': 0,
      // На всякий случай явно выключим и здесь:
      '@typescript-eslint/await-thenable': 'off',
      // И классика для React:
      'react/react-in-jsx-scope': 'off',
    },
  }
);
