<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAuthenticated
{
    public function handle(Request $request, Closure $next)
    {
        // Check if the user is authenticated
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. You must be logged in to access this route.',
            ], 401);
        }

        // If authenticated, continue request
        return $next($request);
    }
}
