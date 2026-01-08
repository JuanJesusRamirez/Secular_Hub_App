FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Compile TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production

# Copy public assets
COPY public ./public

EXPOSE 3000

CMD ["node", "dist/index.js"]
