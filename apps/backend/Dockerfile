# ─── Stage 1: build (devDependencies + TypeScript compiler) ──────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ─── Stage 2: runtime (prod dependencies only, non-root user) ────────────────
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ARG BACKEND_PORT=3000
ENV PORT=${BACKEND_PORT}

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN addgroup -S talentbridge && adduser -S talentbridge -G talentbridge
USER talentbridge

EXPOSE ${BACKEND_PORT}

CMD ["node", "dist/main"]
