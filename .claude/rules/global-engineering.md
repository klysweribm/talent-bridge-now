---
paths:
  - "apps/**/*.{ts,tsx}"
  - "packages/**/*.ts"
---

# Global engineering practices (frontend + backend + packages)

Detail and examples: `good-practices/BEST-PRACTICES.md` §2.7 (read only the section you need).

- TypeScript strict, zero `any` — use `unknown` + type guards when a shape is genuinely unknown.
- `readonly` on every interface prop.
- Type prefixes on new code (MUST): `interface` → `I` (`ICandidate`), `type` → `T` (`TStage`), `enum` → `E` (`ERole`). Don't mass-rename existing code just to apply this — only new/touched types.
- Declarative over imperative: `.map/.filter/.reduce`/spread instead of `for` + `push`/mutation.
- SRP: if a file/function needs "and" to describe what it does, extract.
- Error handling: never a silent `catch {}`. Backend → NestJS `Logger` + typed Nest exception with context (`NotFoundException(\`Process ${id} not found\`)`). Frontend → surface the error through React Query's `error` state, don't swallow it.
- Never log passwords, tokens, OTP codes or full PII (candidate email/phone/CV content) — log ids instead.
- No magic values: see `.claude/rules/anti-hardcoding.md`.
- A file over its line limit is a missing abstraction, not a formatting issue. The numeric limits live only in `good-practices/validate-quality.mjs`'s `LIMITS` array; new debt over the limit goes to `good-practices/DEBT_TECH.md` with an ID **before** the commit.
