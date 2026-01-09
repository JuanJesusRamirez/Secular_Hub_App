FROM node:24-slim AS builder
WORKDIR /app

# Install system dependencies required by Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and install deps for build
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy full source and build Next.js
COPY . .
RUN npm run build

# Ensure public directory exists
RUN mkdir -p /app/public

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and Prisma schema
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma

# Install production deps and generate Prisma client for this platform
RUN npm ci --only=production && npx prisma generate

# Copy build artifacts and public directory from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
