# This Dockerfile is designed for production. For local development with
# live-reload, use Dockerfile.dev (referenced by docker-compose.yml).

# --- Stage 1: build ---
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: serve the compiled static assets with nginx ---
FROM nginx:alpine

COPY --from=build /app/dist/flowboard/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
