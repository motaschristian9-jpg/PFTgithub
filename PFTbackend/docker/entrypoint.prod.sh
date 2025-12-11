#!/bin/bash
set -e

# Run Migrations
echo "Running Migrations..."
php artisan migrate --force

# Run Category Seeder (Via standard DatabaseSeeder)
echo "Seeding Database..."
php artisan db:seed --force

# Optimize Caches
echo "Caching Configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Supervisor
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
