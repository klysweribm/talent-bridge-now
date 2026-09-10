/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    // ─── Zero `any` ───────────────────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',

    // ─── Complejidad ciclomática ──────────────────────────────────────────────
    'complexity': ['warn', { max: 10 }],
    'max-depth': ['warn', 4],

    // ─── Límites de líneas por tipo (Atomic Design + Hexagonal) ──────────────
    // Aplicar según patrón de archivo — ver overrides abajo
    'max-lines': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 30, skipBlankLines: true, skipComments: true }],

    // ─── Imports limpios ──────────────────────────────────────────────────────
    'no-duplicate-imports': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

    // ─── Calidad general ──────────────────────────────────────────────────────
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },

  overrides: [
    // ── ⚛️  Atoms: 50 líneas máximo ────────────────────────────────────────────
    {
      files: ['apps/web/src/atoms/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── 🔶 Molecules: 90 líneas máximo ─────────────────────────────────────────
    {
      files: ['apps/web/src/molecules/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── 🔷 Organisms: 100 líneas máximo ────────────────────────────────────────
    {
      files: ['apps/web/src/organisms/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── 📄 Pages: 90 líneas máximo ─────────────────────────────────────────────
    {
      files: ['apps/web/src/pages/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Hooks: 30 líneas máximo ────────────────────────────────────────────────
    {
      files: ['apps/web/src/hooks/**/*.ts'],
      rules: {
        'max-lines': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Controllers: 55 líneas máximo ─────────────────────────────────
    {
      files: ['apps/api/src/**/*.controller.ts'],
      rules: {
        'max-lines': ['error', { max: 55, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Services: 80 líneas máximo ────────────────────────────────────
    {
      files: ['apps/api/src/**/*.service.ts'],
      rules: {
        'max-lines': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Ports: 50 líneas máximo ───────────────────────────────────────
    {
      files: ['apps/api/src/**/*.port.ts'],
      rules: {
        'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Adapters: 100 líneas máximo ───────────────────────────────────
    {
      files: ['apps/api/src/**/*.adapter.ts'],
      rules: {
        'max-lines': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── DTOs: 45 líneas máximo ─────────────────────────────────────────────────
    {
      files: ['apps/api/src/**/*.dto.ts'],
      rules: {
        'max-lines': ['error', { max: 45, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Modules: 60 líneas máximo ───────────────────────────────────────────────
    {
      files: ['apps/api/src/**/*.module.ts'],
      rules: {
        'max-lines': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Tests: sin límite de líneas (pero funciones máx 50) ───────────────────
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'max-lines': 'off',
        'max-lines-per-function': ['warn', { max: 50 }],
        '@typescript-eslint/no-explicit-any': 'off', // mocks pueden necesitarlo
      },
    },
  ],
};
