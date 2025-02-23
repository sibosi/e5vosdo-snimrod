# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .

ARG AUTH_SECRET
ARG AUTH_TRUST_HOST
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG BACKUP_FOLDER_ID
ARG SERVICE_ACCOUNT_KEY
ARG SERVICE_ACCOUNT_KEY_PATH
ARG IGNORE_BUILD_ERRORS
ARG FAKE_AUTH
ARG MYSQL_HOST
ARG MYSQL_PORT
ARG MYSQL_DATABASE
ARG MYSQL_USER
ARG MYSQL_PASSWORD
ARG ENCRYPTION_PASSWORD
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG PUBLIC_VAPID_KEY
ARG PRIVATE_VAPID_KEY

RUN npm run build

# Stage 2: Production
FROM node:lts-alpine
RUN apk add --no-cache mysql-client && npm install -g pm2@latest
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
