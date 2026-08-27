# Multi-stage Dockerfile for Restaurant Order Management System
# This can be used for Docker deployment or container-based platforms

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend code
COPY server/ ./

# Copy Prisma files
COPY server/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy built frontend to serve statically (optional)
COPY --from=frontend-build /app/client/dist ./public

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
