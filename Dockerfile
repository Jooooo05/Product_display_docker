# ==========================
# Stage 1: Build Frontend
# ==========================
FROM node:20-alpine AS node

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies sesuai package-lock.json
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build assets (Vite)
RUN npm run build

# ==========================
# Stage 2: PHP Application
# ==========================
FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

# Install dependency sistem yang dibutuhkan extension PHP umum di Laravel
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    freetype-dev \
    libjpeg-turbo-dev \
    oniguruma-dev \
    mysql-client

# Install PHP extension yang biasa dipakai Laravel
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip \
    exif \
    pcntl \
    gd \
    bcmath

# Copy Composer dari image resmi-nya (bukan install manual)
COPY --m=composer:2 /usr/bin/composer /usr/bin/composer

# Copy source code project
COPY . .

# Copy hasil build frontend
COPY --from=node /app/public/build ./public/build

# Install dependency PHP (production, tanpa dev dependency)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permission folder yang perlu ditulis Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]