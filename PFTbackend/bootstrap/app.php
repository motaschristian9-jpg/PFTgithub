<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Load environment file
if (file_exists(__DIR__ . '/../.env.production')) {
    $app->loadEnvironmentFrom('.env.production');
} else {
    $app->loadEnvironmentFrom('.env');
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Custom CORS
        $middleware->append(\App\Http\Middleware\CustomCors::class);

        // NOTE: Comment out if using pure API token auth (not SPA sessions).
        // This can cause issues with API-only routes.
        // $middleware->append(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class);
    
        // Allow stateful API sessions for Sanctum (only if needed for hybrid auth)
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle authentication exceptions for API routes
        $exceptions->render(function (Throwable $e, $request) {
            // Log the exception for debugging
            \Log::error('Exception caught: ' . $e->getMessage() . ' | Type: ' . get_class($e) . ' | URL: ' . $request->fullUrl());

            // Check if it's an authentication exception (e.g., no bearer token)
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                // Always return JSON for API routes, regardless of expectsJson()
                if ($request->is('api/*')) {
                    return response()->json([
                        'error' => 'Unauthorized. Please provide a valid bearer token.',
                        'message' => $e->getMessage(),
                    ], 401);
                }
            }

            // Optional: Handle other common exceptions for API routes
            if ($request->is('api/*')) {
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'error' => 'Validation failed.',
                        'message' => $e->errors(),
                    ], 422);
                }
                // Add more if needed, e.g., for other exceptions
            }
        });
    })
    ->create();