# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install ALL dependencies (including devDependencies for the build)
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Build the NestJS app
RUN npx nest build

# ---- Stage 2: Production ----
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy prisma schema and generate client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy built dist from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 4000

# Start the app
CMD ["node", "dist/main"]
