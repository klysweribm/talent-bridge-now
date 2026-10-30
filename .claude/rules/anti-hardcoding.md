---
paths:
  - "apps/backend/src/**/*.ts"
  - "apps/frontend/src/**/*.{ts,tsx}"
---

# Anti-hardcoding

- **IBM Cloud / external config only from env vars**, never a literal (not even "temporary"): `MONGODB_URI`, `JWT_SECRET`/`JWT_EXPIRATION`, `THROTTLE_*`. Reserved (not in `.env.example` until their adapter exists, then added there in the same commit): `WATSONX_*`, `COS_*`, `SMTP_*`, `SLACK_WEBHOOK_URL`, `JWT_REFRESH_EXPIRATION`, `APPID_*` (Fase 2). Full list in `.env.example` — a new var is added there in the same commit, with a placeholder value.
- Backend reads config through `@nestjs/config` (`ConfigService`) in the adapter/module that needs it, never `process.env` scattered inside services or domain.
- Frontend reads only `import.meta.env.VITE_*`, centralized in `src/config/` — components/hooks import from there, never `import.meta.env` directly. Never put a secret in a `VITE_*` var (it ships to the browser).
- Never a real key/token/password in source, test fixtures, docs or `docker-compose*.yml` defaults.
- Domain enums (process stages, roles, interview status) are defined once and reused — never retype the literal union in a new file.
- Colors/spacing/typography: tokens from `tailwind.config.ts` / `config/design-tokens.ts`, never raw hex/px in a component.
- Line limits: only in `good-practices/validate-quality.mjs`'s `LIMITS` array — don't restate a "max N lines" number in a comment.
