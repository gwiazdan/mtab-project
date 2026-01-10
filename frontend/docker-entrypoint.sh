#!/bin/sh
set -e

# Generate .htpasswd from environment variables
if [ -n "$API_USERNAME" ] && [ -n "$API_PASSWORD" ]; then
    echo "Generating .htpasswd for API authentication..."
    mkdir -p /etc/nginx
    echo "$API_PASSWORD" | openssl passwd -apr1 -stdin > /tmp/hash.txt
    HASH=$(cat /tmp/hash.txt)
    echo "$API_USERNAME:$HASH" > /etc/nginx/.htpasswd
    chmod 644 /etc/nginx/.htpasswd
    rm /tmp/hash.txt
fi

# Start nginx
exec nginx -g "daemon off;"
