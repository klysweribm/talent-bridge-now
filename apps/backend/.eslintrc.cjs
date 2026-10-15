/** @type {import('eslint').Linter.Config} */
const qualityConfig = require('../../good-practices/.eslintrc-quality.js');

module.exports = {
  ...qualityConfig,
  root: true,
  env: { node: true, es2022: true, jest: true },
  parserOptions: {
    ...qualityConfig.parserOptions,
    // tsconfig.eslint.json incluye src + test (e2e) para que el linter tenga
    // info de tipos en ambos — tsconfig.json (build) sigue excluyendo test/
    // y *.spec.ts, esa exclusión no cambia.
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [...qualityConfig.plugins],
  rules: {
    ...qualityConfig.rules,
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  // Sin excepción de `no-explicit-any` en specs: los fakes implementan el port
  // (ver .claude/rules/testing.md), así que `any` nunca es necesario.
  overrides: [...qualityConfig.overrides],
};
