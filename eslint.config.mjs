import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { ignores: ['**/node_modules', '**/dist', '**/out'] },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  eslintConfigPrettier,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '(^_|^React$|Type$)',
          ignoreRestSiblings: true
        }
      ]
    }
  },

  {
    files: ['src/main/**/*.{ts,tsx}', 'src/preload/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node
    }
  },

  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      ...(react.configs.recommended?.rules ?? {}),
      ...(react.configs['jsx-runtime']?.rules ?? {}),
      ...(reactHooks.configs.recommended?.rules ?? {}),

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    },
    languageOptions: {
      globals: globals.browser
    }
  }
]
