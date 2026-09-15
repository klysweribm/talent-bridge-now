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

  // NOTA: los globs de `files` abajo son relativos al paquete (apps/frontend
  // o apps/backend) porque ESLint siempre corre con ese directorio como cwd
  // — a diferencia de validate-quality.mjs, que sí usa paths absolutos desde
  // la raíz del monorepo. Cada apps/<paquete>/.eslintrc.cjs importa/extiende
  // este archivo, así que estos patrones deben coincidir con `src/...` dentro
  // de ese paquete, sin el prefijo `apps/frontend/` o `apps/backend/`.
  overrides: [
    // ── ⚛️  Atoms: 50 líneas máximo ────────────────────────────────────────────
    {
      files: ['src/features/*/components/atoms/**/*.tsx', 'src/shared/components/atoms/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── 🔶 Molecules: 90 líneas máximo ─────────────────────────────────────────
    {
      files: ['src/features/*/components/molecules/**/*.tsx', 'src/shared/components/molecules/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── 🔷 Organisms: 100 líneas máximo ────────────────────────────────────────
    {
      files: ['src/features/*/components/organisms/**/*.tsx', 'src/shared/components/organisms/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── 📄 Pages: 90 líneas máximo ─────────────────────────────────────────────
    {
      files: ['src/features/*/components/pages/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Hooks: 60 líneas máximo ────────────────────────────────────────────────
    {
      files: ['src/features/*/hooks/**/*.ts'],
      rules: {
        'max-lines': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Infrastructure: 50 líneas máximo ──────────────────────────────────────
    {
      files: ['src/features/*/infrastructure/**/*.ts'],
      rules: {
        'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Zustand stores: 50 líneas máximo ──────────────────────────────────────
    {
      files: ['src/features/*/store/**/*.store.ts'],
      rules: {
        'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Controllers: 55 líneas máximo ─────────────────────────────────
    {
      files: ['src/capabilities/*/**/*.controller.ts'],
      rules: {
        'max-lines': ['error', { max: 55, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Services: 80 líneas máximo ────────────────────────────────────
    {
      files: ['src/capabilities/*/**/*.service.ts'],
      rules: {
        'max-lines': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Ports: 50 líneas máximo ───────────────────────────────────────
    {
      files: ['src/capabilities/*/**/*.port.ts'],
      rules: {
        'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Backend Adapters: 100 líneas máximo ───────────────────────────────────
    {
      files: ['src/capabilities/*/**/*.adapter.ts'],
      rules: {
        'max-lines': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── DTOs: 45 líneas máximo ─────────────────────────────────────────────────
    {
      files: ['src/capabilities/*/**/*.dto.ts'],
      rules: {
        'max-lines': ['error', { max: 45, skipBlankLines: true, skipComments: true }],
      },
    },

    // ── Modules: 60 líneas máximo ───────────────────────────────────────────────
    {
      files: ['src/capabilities/*/**/*.module.ts'],
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
