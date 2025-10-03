import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'src/routeTree.gen.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'coverage/',
      '.env*',
      '*.log',
      '.vscode/',
      '.idea/',
      '.DS_Store',
      'Thumbs.db'
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: {
                    jsx: true,
                },
                sourceType: 'module',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        plugins: {
          'react-hooks': reactHooks,
          'react-refresh': reactRefresh,
          react,
          'jsx-a11y': jsxA11y,
          prettier,
        },
        rules: {
          ...reactHooks.configs.recommended.rules,
          ...react.configs.recommended.rules,
          ...react.configs['jsx-runtime'].rules,
          ...jsxA11y.configs.recommended.rules,
          'prettier/prettier': 'error',
          'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
          ],
            // TypeScript 相关规则
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            // React 相关规则
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            // 通用规则
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
)