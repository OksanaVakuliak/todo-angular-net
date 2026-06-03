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
EXPOSE 8081

RUN addgroup -S app -g 10001 \
    && adduser -S -D -H -u 10001 -G app app \
    && sed -i 's@^user .*;@# user directive disabled for unprivileged runtime@' /etc/nginx/nginx.conf \
    && sed -i 's@/run/nginx.pid@/tmp/nginx.pid@g; s@/var/run/nginx.pid@/tmp/nginx.pid@g' /etc/nginx/nginx.conf \
    && chown -R app:app /usr/share/nginx/html /etc/nginx/conf.d /var/cache/nginx \
    && touch /tmp/nginx.pid \
    && chown app:app /tmp/nginx.pid

COPY src/frontend/todo-ui/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/todo-ui/browser ./
RUN chown app:app /etc/nginx/conf.d/default.conf

USER app
