<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Create the Laravel Application instance
$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// 🧩 Detect and load the correct environment file
if (file_exists(__DIR__ . '/../.env.production')) {
    $app->loadEnvironmentFrom('.env.production');
} else {
    // Default to .env (local)
    $app->loadEnvironmentFrom('.env');
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Append your Custom CORS Middleware
        $middleware->append(\App\Http\Middleware\CustomCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Customize exception handling if needed
    })
    ->create();
