# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app/new_app
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
COPY new_app/package.json new_app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY new_app/ ./
ARG NUXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID
ARG NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NUXT_PUBLIC_ANALYTICS_WEBSITE_ID
ENV NITRO_PRESET=node-server
RUN pnpm exec nuxt prepare && pnpm build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 NITRO_HOST=0.0.0.0 NITRO_PORT=3000
COPY --from=build --chown=node:node /app/new_app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
