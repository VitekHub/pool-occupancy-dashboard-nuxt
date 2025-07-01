import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'

export default [
  // Global ignores
  {
    ignores: ['.nuxt/**', 'dist/**', '.output/**', 'node_modules/**'],
  },

  // Base JavaScript recommended rules
  js.configs.recommended,

  // Vue recommended rules
  ...vue.configs['flat/recommended'],

  // Global configuration for all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Vue and TypeScript files configuration
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      vue,
    },
    rules: {
      // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Nuxt-specific overrides
  {
    files: ['nuxt.config.{js,ts}', 'app.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Configuration files
  {
    files: ['*.config.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
]
