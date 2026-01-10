FROM node:24-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code
COPY . .

# Build application
RUN npm run build


# Production stage - nginx
FROM nginx:alpine

# Install openssl for htpasswd generation
RUN apk add --no-cache openssl

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy public assets
COPY public /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Run entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
