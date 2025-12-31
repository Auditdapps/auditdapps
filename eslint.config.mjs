// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  {
    ignores: [
      'dist','build','node_modules','.next','.vercel','coverage',
      'postcss.config.cjs','tailwind.config.cjs', // ignore CJS tool configs
      'src/types/supabase.ts',                     // generated/binary
      'src/types/*.d.ts',                          // shims
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      tailwindcss: tailwind,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: { callees: ['cn'] },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',                    // TS replaces prop-types
      'tailwindcss/no-custom-classname': 'off',
      'react/no-array-index-key': 'warn',

      // Soften for now; tighten later
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Temporary while you replace placeholder anchors
      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },
];
