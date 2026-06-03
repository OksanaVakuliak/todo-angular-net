# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS build
WORKDIR /app

COPY ["src/frontend/todo-ui/package.json", "src/frontend/todo-ui/package-lock.json", "./"]
RUN --mount=type=cache,id=todoapp-npm,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY src/frontend/todo-ui/ .
RUN npm run build -- --progress false

FROM nginx:1.27-alpine AS final
WORKDIR /usr/share/nginx/html
EXPOSE 80

COPY src/frontend/todo-ui/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/todo-ui/browser ./
