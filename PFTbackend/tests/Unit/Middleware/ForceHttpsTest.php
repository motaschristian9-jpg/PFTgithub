<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\ForceHttps;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class ForceHttpsTest extends TestCase
{
    public function test_force_https_redirects_in_production_when_not_secure()
    {
        // Set the app environment to production
        Config::set('app.env', 'production');

        $middleware = new ForceHttps();
        $request = Request::create('http://localhost:8000/test', 'GET');  // Updated to localhost:8000

        $result = $middleware->handle($request, function () {
            return response('test');
        });

        $this->assertEquals(302, $result->getStatusCode());
        $this->assertEquals('https://localhost:8000/test', $result->getTargetUrl());
    }

    public function test_force_https_does_not_redirect_in_production_when_secure()
    {
        Config::set('app.env', 'production');

        $middleware = new ForceHttps();
        $request = Request::create('https://localhost:8000/test', 'GET');  // Updated to localhost:8000

        $response = response('test');
        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertEquals($response, $result);
    }

    public function test_force_https_does_not_redirect_in_non_production()
    {
        Config::set('app.env', 'local');

        $middleware = new ForceHttps();
        $request = Request::create('http://localhost:8000/test', 'GET');  // Updated to localhost:8000

        $response = response('test');
        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $this->assertEquals($response, $result);
    }

    public function test_force_https_preserves_query_parameters()
    {
        Config::set('app.env', 'production');

        $middleware = new ForceHttps();
        $request = Request::create('http://localhost:8000/test?param=value', 'GET');  // Updated to localhost:8000

        $result = $middleware->handle($request, function () {
            return response('test');
        });

        $this->assertEquals(302, $result->getStatusCode());
        $this->assertEquals('https://localhost:8000/test?param=value', $result->getTargetUrl());
    }
}
