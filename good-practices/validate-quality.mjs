#!/usr/bin/env node
/**
 * validate-quality.mjs
 * Script de validación de calidad — ejecutar desde raíz del monorepo
 *
 * Uso:
 *   node good-practices/validate-quality.mjs
 *   node good-practices/validate-quality.mjs --strict   (falla en moderados)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

// ─── Configuración de límites ────────────────────────────────────────────────

const LIMITS = [
  // Frontend — Feature Slices + Atomic Design
  { pattern: /apps\/frontend\/src\/(features\/[^/]+|shared)\/components\/atoms\/.*\.tsx$/, limit: 50, level: 'error', label: '⚛️  Atom' },
  { pattern: /apps\/frontend\/src\/(features\/[^/]+|shared)\/components\/molecules\/.*\.tsx$/, limit: 90, level: 'error', label: '🔶 Molecule' },
  { pattern: /apps\/frontend\/src\/(features\/[^/]+|shared)\/components\/organisms\/.*\.tsx$/, limit: 100, level: 'error', label: '🔷 Organism' },
  { pattern: /apps\/frontend\/src\/features\/[^/]+\/components\/pages\/.*\.tsx$/, limit: 90, level: 'error', label: '📄 Page' },
  { pattern: /apps\/frontend\/src\/features\/[^/]+\/hooks\/.*\.ts$/, limit: 60, level: 'warn', label: '🪝 Hook' },
  { pattern: /apps\/frontend\/src\/features\/[^/]+\/infrastructure\/.*\.ts$/, limit: 50, level: 'error', label: '🔗 Infrastructure' },
  { pattern: /apps\/frontend\/src\/features\/[^/]+\/store\/.*\.store\.ts$/, limit: 50, level: 'error', label: '🗃️  Store' },
  // Backend — Hexagonal + DDD por capability
  { pattern: /apps\/backend\/src\/capabilities\/[^/]+\/.*\.controller\.ts$/, limit: 55, level: 'error', label: '🎮 Controller' },
  { pattern: /apps\/backend\/src\/capabilities\/[^/]+\/.*\.service\.ts$/, limit: 80, level: 'warn', label: '⚙️  Service' },
  { pattern: /apps\/backend\/src\/capabilities\/[^/]+\/.*\.port\.ts$/, limit: 50, level: 'warn', label: '🔌 Port' },
  { pattern: /apps\/backend\/src\/capabilities\/[^/]+\/.*\.adapter\.ts$/, limit: 100, level: 'warn', label: '🔄 Adapter' },
  { pattern: /apps\/backend\/src\/capabilities\/[^/]+\/.*\.dto\.ts$/, limit: 45, level: 'error', label: '📋 DTO' },
  { pattern: /apps\/backend\/src\/capabilities\/[^/]+\/.*\.module\.ts$/, limit: 60, level: 'warn', label: '📦 Module' },
];

// ─── Utilidades ──────────────────────────────────────────────────────────────

function countLines(filePath) {
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((l) => l.trim() !== '' && !l.trim().startsWith('//') && !l.trim().startsWith('*'))
    .length;
}

const isTestFile = (name) => /\.(test|spec)\.(ts|tsx)$/.test(name);

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory() && !['node_modules', 'dist', '.turbo', '__tests__'].includes(entry)) {
      walk(full, results);
    } else if (stat.isFile() && ['.ts', '.tsx'].includes(extname(entry)) && !isTestFile(entry)) {
      results.push(full);
    }
  }
  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const strict = process.argv.includes('--strict');
const files = walk('apps');

const violations = { error: [], warn: [] };

for (const file of files) {
  const rel = relative(process.cwd(), file).replace(/\\/g, '/');
  const config = LIMITS.find((c) => c.pattern.test(rel));
  if (!config) continue;

  const lines = countLines(file);
  if (lines <= config.limit) continue;

  const pct = Math.round((lines / config.limit) * 100);
  const entry = { file: rel, lines, limit: config.limit, pct, label: config.label };

  if (pct > 200 || config.level === 'error') {
    violations.error.push(entry);
  } else {
    violations.warn.push(entry);
  }
}

// ─── Output ──────────────────────────────────────────────────────────────────

let exitCode = 0;

if (violations.error.length > 0) {
  console.log('\n🔴 CRÍTICO — Estos archivos BLOQUEAN el merge:\n');
  for (const v of violations.error) {
    console.log(`  ${v.label} ${v.file}`);
    console.log(`    ${v.lines} líneas / ${v.limit} límite (${v.pct}%)`);
    console.log(`    → Registrar en DEBT_TECH.md y refactorizar\n`);
  }
  exitCode = 1;
}

if (violations.warn.length > 0) {
  console.log('\n🟡 MODERADO — Registrar en DEBT_TECH.md:\n');
  for (const v of violations.warn) {
    console.log(`  ${v.label} ${v.file}`);
    console.log(`    ${v.lines} líneas / ${v.limit} límite (${v.pct}%)\n`);
  }
  if (strict) exitCode = 1;
}

if (violations.error.length === 0 && violations.warn.length === 0) {
  console.log('\n✅ Todos los archivos cumplen los límites de calidad.\n');
}

const total = files.filter((f) => LIMITS.some((c) => c.pattern.test(relative(process.cwd(), f).replace(/\\/g, '/')))).length;
console.log(`📊 Archivos analizados: ${total} | Críticos: ${violations.error.length} | Moderados: ${violations.warn.length}\n`);

process.exit(exitCode);
