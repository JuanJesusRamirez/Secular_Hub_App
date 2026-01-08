FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install deps for build
COPY package*.json ./
RUN npm ci

# Copy full source and build Next.js
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy build artifacts and public assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
