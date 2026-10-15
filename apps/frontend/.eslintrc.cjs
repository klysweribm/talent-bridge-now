/** @type {import('eslint').Linter.Config} */
const qualityConfig = require('../../good-practices/.eslintrc-quality.js');

module.exports = {
  ...qualityConfig,
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: {
    ...qualityConfig.parserOptions,
    ecmaFeatures: { jsx: true },
    // tsconfig.eslint.json incluye TODOS los archivos (src, configs, tests)
    // para que el linter tenga info de tipos en todo — tsconfig.json (build)
    // sigue excluyendo tests, esa exclusión no cambia.
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [...qualityConfig.plugins, 'react-hooks'],
  rules: {
    ...qualityConfig.rules,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  // *.tsbuildinfo, vite.config.d.ts y vite.config.js son artefactos de `tsc -b`
  // (tsconfig.node.json es composite, sin `noEmit`) — no están en
  // tsconfig.eslint.json y no son código fuente versionado.
  ignorePatterns: ['dist', 'node_modules', 'coverage', '*.tsbuildinfo', 'vite.config.d.ts', 'vite.config.js'],
  overrides: [
    ...qualityConfig.overrides,
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // mocks pueden necesitarlo
        // Los archivos de test priorizan legibilidad del escenario (arrange/act/assert)
        // sobre el límite de líneas por función que aplica al código de producción.
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['src/test/**'],
      rules: {
        'no-console': 'off', // setup de test suprime warnings conocidos de librerías
      },
    },
  ],
};
