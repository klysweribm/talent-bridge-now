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
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  overrides: [
    ...qualityConfig.overrides,
    {
      files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // mocks pueden necesitarlo
      },
    },
  ],
};
