<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\ApiResponseTrait;
use Tests\TestCase;

class ApiResponseTraitTest extends TestCase
{
    use ApiResponseTrait;

    public function test_success_response_without_data()
    {
        $response = $this->success(null, 'Test message', 200);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals([
            'success' => true,
            'message' => 'Test message',
        ], $response->getData(true));
    }

    public function test_success_response_with_data()
    {
        $data = ['key' => 'value'];
        $response = $this->success($data, 'Test message', 201);

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertEquals([
            'success' => true,
            'message' => 'Test message',
            'data' => $data,
        ], $response->getData(true));
    }

    public function test_error_response_without_errors()
    {
        $response = $this->error('Test error', 400);

        $this->assertEquals(400, $response->getStatusCode());
        $this->assertEquals([
            'success' => false,
            'message' => 'Test error',
        ], $response->getData(true));
    }

    public function test_error_response_with_errors()
    {
        $errors = ['field' => ['Error message']];
        $response = $this->error('Test error', 422, $errors);

        $this->assertEquals(422, $response->getStatusCode());
        $this->assertEquals([
            'success' => false,
            'message' => 'Test error',
            'errors' => $errors,
        ], $response->getData(true));
    }
}
