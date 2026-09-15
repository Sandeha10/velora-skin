# Stage 1: Build & Install Production Dependencies
FROM node:22-alpine AS dependencies
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

# node-linker=hoisted  flat node_modules 
RUN pnpm install --prod --frozen-lockfile --config.node-linker=hoisted

# Stage 2: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app

USER node
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/server.js"]