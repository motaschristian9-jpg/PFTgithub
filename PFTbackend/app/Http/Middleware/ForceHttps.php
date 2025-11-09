<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        // Force HTTPS in production
        if (!$request->secure() && config('app.env') === 'production') {
            return redirect()->secure($request->getRequestUri());
        }

        return $next($request);
    }
}