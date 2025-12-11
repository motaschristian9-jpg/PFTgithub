FROM php:8.3-fpm

# Install system dependencies including Nginx and Supervisor
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    ca-certificates

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd opcache

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy OpCache configuration
COPY docker/php/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy Nginx Configuration
COPY docker/nginx/prod.conf /etc/nginx/sites-available/default
RUN rm /etc/nginx/sites-enabled/default && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy Supervisor Configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy Application Code
COPY --chown=www-data:www-data . /var/www

# Run Composer Install (Production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy Entrypoint
COPY docker/entrypoint.prod.sh /usr/local/bin/start-container
RUN chmod +x /usr/local/bin/start-container

# Expose port 80
EXPOSE 80

# Start Container
ENTRYPOINT ["start-container"]
