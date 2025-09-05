############################################################
# 1) Base dependencies / build stage
############################################################
FROM node:lts-alpine AS builder
WORKDIR /app

# Install system deps needed for native modules (e.g. sharp)
RUN apk add --no-cache g++ libc6-compat make python3

# Copy only package manifests first for better layer caching
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
# (If you add packages/* later, also COPY their package.json files here)

# Install all workspaces (dev deps included for build)
RUN npm ci

# Copy the full repo
COPY . .

# Build-time args (forwarded by docker-compose to allow Next.js to inline them if referenced directly)
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

# Build the web app via Turbo (script defined in root package.json)
RUN npm run web-build

############################################################
# 2) Runtime image
############################################################
FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache mysql-client

# Copy entire workspace (simpler + ensures runtime deps present). For a slimmer image,
# switch Next.js to output: 'standalone' and copy only .next/standalone + public.
COPY --from=builder /app /app

# Set working dir to the web app workspace
WORKDIR /app/apps/web
EXPOSE 3000

# Start Next.js production server
CMD ["npm", "run", "start"]
