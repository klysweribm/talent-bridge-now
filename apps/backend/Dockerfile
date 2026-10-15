# Imagen de producción del backend (app "tb-api" en IBM Code Engine).
#
# El contexto de build es la RAÍZ del repo, porque el backend importa
# `packages/shared-types` vía alias (../../packages/shared-types):
#   docker build -f apps/backend/Dockerfile -t tb-api .

# ─── Stage 1: build (devDependencies + TypeScript compiler) ──────────────────
FROM node:22-alpine AS build

WORKDIR /repo

COPY packages/shared-types ./packages/shared-types
COPY apps/backend/package*.json ./apps/backend/
RUN cd apps/backend && npm ci

COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

RUN cd apps/backend && npm run build

# ─── Stage 2: runtime (prod dependencies only, non-root user) ────────────────
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ARG BACKEND_PORT=3000
ENV PORT=${BACKEND_PORT}

WORKDIR /app

COPY apps/backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /repo/apps/backend/dist ./dist

RUN addgroup -S talentbridge && adduser -S talentbridge -G talentbridge
USER talentbridge

EXPOSE ${BACKEND_PORT}

CMD ["node", "dist/main"]
