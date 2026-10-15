# Imagen de producción del frontend (app "tb-web" en IBM Code Engine, ver ADR-006).
#
# El contexto de build es la RAÍZ del repo, porque el frontend importa
# `packages/shared-types` vía alias (../../packages/shared-types):
#   docker build -f apps/frontend/Dockerfile -t tb-web .
#   docker run -p 8080:8080 -e API_UPSTREAM=http://tb-api.<project>.svc tb-web

# ─── Build: Vite → dist/ ──────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /repo

COPY packages/shared-types ./packages/shared-types
COPY apps/frontend/package.json apps/frontend/package-lock.json ./apps/frontend/
RUN cd apps/frontend && npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --no-audit --no-fund

COPY apps/frontend ./apps/frontend
RUN cd apps/frontend && npm run build

# ─── Runtime: nginx no-root, SPA estática + proxy /api ────────────────────────
FROM nginxinc/nginx-unprivileged:1.27-alpine

# El entrypoint aplica envsubst a /etc/nginx/templates/*.template, sustituyendo
# solo variables definidas (API_UPSTREAM); $uri y demás variables de nginx quedan intactas.
COPY apps/frontend/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /repo/apps/frontend/dist /usr/share/nginx/html

ENV API_UPSTREAM=http://localhost:3000
EXPOSE 8080
