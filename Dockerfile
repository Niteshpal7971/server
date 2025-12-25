# ---------- Step 1: Build Stage ----------
FROM node:lts-alpine AS builder

WORKDIR /server

# Copy package files + tsconfig first
COPY package*.json tsconfig.json ./

# Install all deps (dev + prod)
RUN npm install

# Copy all files
COPY . .

# Build TypeScript into dist/
RUN npm run build


# ---------- Step 2: Production Stage ----------
FROM node:lts-alpine

WORKDIR /server

# Copy only package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled code from builder stage
COPY --from=builder /server/dist ./dist

# Copy .env if needed
COPY .env .env

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
