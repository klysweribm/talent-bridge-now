#!/usr/bin/env node
/**
 * check-docs-drift — hook Stop. SOLO AVISA: siempre termina con exit 0 y nunca bloquea.
 *
 * Avisa cuando:
 *  1. hay commits de apps/ o packages/ posteriores al último cambio de ROADMAP.md;
 *  2. un documento vigente tiene enlaces Markdown rotos;
 *  3. un documento vigente apunta a un archivo de legacy_docs/.
 *
 * Sin avisos no imprime nada. Con avisos imprime un JSON `{ "systemMessage": "..." }`
 * (el formato que el harness muestra al usuario) de una sola línea.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const MAX_EXAMPLES = 2;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', 'legacy_docs']);
// Documentos vigentes: lo que el equipo lee hoy. legacy_docs/ queda fuera a propósito.
const DOC_ROOTS = ['ROADMAP.md', 'CLAUDE.md', 'README.md', 'docs', 'good-practices', '.claude/rules', '.claude/memory'];

const root = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return process.cwd();
  }
})();

const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();

function collectMarkdown(path, out = []) {
  const abs = join(root, path);
  if (!existsSync(abs)) return out;
  const stat = statSync(abs);
  if (stat.isFile()) {
    if (abs.endsWith('.md')) out.push(abs);
    return out;
  }
  for (const entry of readdirSync(abs)) {
    if (SKIP_DIRS.has(entry)) continue;
    collectMarkdown(join(path, entry), out);
  }
  return out;
}

/** Quita bloques de código y código en línea: ahí los corchetes y rutas no son enlaces. */
const stripCode = (text) => text.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, '')).replace(/`[^`\n]*`/g, '');

function staleRoadmap() {
  try {
    const lastRoadmap = git(['log', '-1', '--format=%H', '--', 'ROADMAP.md']);
    if (!lastRoadmap) return null;
    const count = Number(git(['rev-list', '--count', `${lastRoadmap}..HEAD`, '--', 'apps', 'packages']));
    return count > 0 ? count : null;
  } catch {
    return null;
  }
}

function scanDocs() {
  const broken = [];
  const legacy = [];
  const files = DOC_ROOTS.flatMap((path) => collectMarkdown(path));
  for (const file of files) {
    const rel = relative(root, file);
    const lines = stripCode(readFileSync(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
        const target = match[1].split('#')[0];
        if (!target || /^(https?:|mailto:|tel:)/i.test(target)) continue;
        const resolved = target.startsWith('/') ? join(root, target) : resolve(dirname(file), target);
        if (!existsSync(resolved)) broken.push(`${rel}:${index + 1} → ${target}`);
        else if (/(^|\/)legacy_docs\//.test(relative(root, resolved))) legacy.push(`${rel}:${index + 1}`);
      }
      // Ruta concreta dentro de legacy_docs/ (no la mera mención del directorio).
      if (/legacy_docs\/[\w.-]/.test(line) && !legacy.includes(`${rel}:${index + 1}`)) legacy.push(`${rel}:${index + 1}`);
    });
  }
  return { broken, legacy };
}

const examples = (items) => items.slice(0, MAX_EXAMPLES).join('; ') + (items.length > MAX_EXAMPLES ? `; +${items.length - MAX_EXAMPLES} más` : '');

try {
  const warnings = [];
  const stale = staleRoadmap();
  if (stale) warnings.push(`${stale} commit(s) de apps/ o packages/ posteriores al último cambio de ROADMAP.md`);
  const { broken, legacy } = scanDocs();
  if (broken.length) warnings.push(`${broken.length} enlace(s) roto(s): ${examples(broken)}`);
  if (legacy.length) warnings.push(`${legacy.length} referencia(s) a legacy_docs/ en documentos vigentes: ${examples(legacy)}`);
  if (warnings.length) {
    process.stdout.write(`${JSON.stringify({ systemMessage: `docs-drift: ${warnings.join(' · ')}` })}\n`);
  }
} catch {
  // Un aviso nunca debe romper la sesión: ante cualquier error, silencio.
}
process.exit(0);
