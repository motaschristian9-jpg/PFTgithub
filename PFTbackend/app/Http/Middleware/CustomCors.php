<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Get allowed origins from config (with fallback to default if null/empty)
        $allowedOriginsConfig = config('app.frontend_url') ?: 'http://localhost:5173';
        $allowedOrigins = array_map('trim', explode(',', $allowedOriginsConfig));

        $requestOrigin = $request->headers->get('Origin');

        // Only set CORS headers if the request origin is allowed
        if ($requestOrigin && in_array($requestOrigin, $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $requestOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        // Handle preflight requests (OPTIONS)
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(200);
        }

        return $response;
    }
}