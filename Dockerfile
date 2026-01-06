# Stage 1: Dependencies
FROM node:18-alpine AS deps

# Install dependencies needed for node-gyp
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for both root and markdown parser
COPY package.json package-lock.json* ./
COPY packages/markdown-parser/package.json ./packages/markdown-parser/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Install markdown parser dependencies
WORKDIR /app/packages/markdown-parser
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/markdown-parser/node_modules ./packages/markdown-parser/node_modules

# Copy all source files
COPY . .

# Build markdown parser first (critical step)
WORKDIR /app/packages/markdown-parser
RUN npm run build

# Build Next.js application
WORKDIR /app
RUN npm run build

# Stage 3: Runner (Production)
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
