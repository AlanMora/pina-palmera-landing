FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build -- --configuration swarm
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=build /app/dist/pina-palmera-landing ./dist
COPY scripts/container-health.mjs ./health.mjs
USER node
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=15s --timeout=4s --start-period=20s --retries=3 CMD ["node","health.mjs"]
CMD ["node","dist/server/server.mjs"]
