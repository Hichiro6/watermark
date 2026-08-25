# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for vite build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Default command
CMD ["nginx", "-g", "daemon off;"]
