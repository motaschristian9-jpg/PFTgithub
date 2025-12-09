#!/bin/bash

# Exit on error
set -e

# Run migrations
php artisan migrate --force

# Start PHP-FPM
php-fpm
