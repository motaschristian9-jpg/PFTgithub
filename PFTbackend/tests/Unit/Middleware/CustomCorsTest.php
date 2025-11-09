<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\CustomCors;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class CustomCorsTest extends TestCase
{
    public function test_custom_cors_sets_headers_for_allowed_origin()
    {
        // Set environment variable for allowed origins
        config(['app.frontend_url' => 'http://localhost:5173,https://example.com']);

        $middleware = new CustomCors();
        $request = Request::create('/api/test', 'GET');
        $request->headers->set('Origin', 'http://localhost:5173');

        $response = new Response('test content');

        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertEquals('http://localhost:5173', $result->headers->get('Access-Control-Allow-Origin'));
        $this->assertEquals('GET, POST, PUT, PATCH, DELETE, OPTIONS', $result->headers->get('Access-Control-Allow-Methods'));
        $this->assertEquals('Content-Type, Authorization, X-Requested-With', $result->headers->get('Access-Control-Allow-Headers'));
        $this->assertEquals('true', $result->headers->get('Access-Control-Allow-Credentials'));
    }

    public function test_custom_cors_does_not_set_headers_for_disallowed_origin()
    {
        config(['app.frontend_url' => 'http://localhost:5173']);

        $middleware = new CustomCors();
        $request = Request::create('/api/test', 'GET');
        $request->headers->set('Origin', 'https://malicious-site.com');

        $response = new Response('test content');

        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertNull($result->headers->get('Access-Control-Allow-Origin'));
        $this->assertNull($result->headers->get('Access-Control-Allow-Methods'));
    }

    public function test_custom_cors_handles_options_request()
    {
        config(['app.frontend_url' => 'http://localhost:5173']);

        $middleware = new CustomCors();
        $request = Request::create('/api/test', 'OPTIONS');
        $request->headers->set('Origin', 'http://localhost:5173');

        $response = new Response('test content');

        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertEquals(200, $result->getStatusCode());
    }

    public function test_custom_cors_handles_multiple_allowed_origins()
    {
        config(['app.frontend_url' => 'http://localhost:5173, https://example.com, https://app.example.com']);

        $middleware = new CustomCors();
        $request = Request::create('/api/test', 'GET');
        $request->headers->set('Origin', 'https://app.example.com');

        $response = new Response('test content');

        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertEquals('https://app.example.com', $result->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_custom_cors_defaults_to_localhost_when_no_env_set()
    {
        // Don't set FRONTEND_URL env
        config(['app.frontend_url' => null]);

        $middleware = new CustomCors();
        $request = Request::create('/api/test', 'GET');
        $request->headers->set('Origin', 'http://localhost:5173');

        $response = new Response('test content');

        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertEquals('http://localhost:5173', $result->headers->get('Access-Control-Allow-Origin'));
    }
}
