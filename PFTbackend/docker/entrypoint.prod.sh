#!/bin/bash
set -e

# Start Supervisor Immediately (Web Server)
echo "Starting Supervisord..."
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &

# Wait a few seconds for services to start
sleep 5

# Run Migrations & Seeding in Background
(
    echo "Running Migrations..."
    php artisan migrate --force
    
    echo "Seeding Database..."
    php artisan db:seed --force
    
    echo "Caching Configuration..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
) &

# Keep script running
wait
