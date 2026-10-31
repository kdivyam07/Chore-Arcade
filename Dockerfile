FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080 DATABASE_PATH=/app/database/arcade.db
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 8080
CMD ["node","backend/src/server.js"]
