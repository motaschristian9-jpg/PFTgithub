<?php

namespace Tests\Unit\Exceptions;

use App\Exceptions\ApiException;
use Tests\TestCase;

class ApiExceptionTest extends TestCase
{
    public function test_api_exception_default_values()
    {
        $exception = new ApiException();

        $this->assertEquals('An error occurred', $exception->getMessage());
        $this->assertEquals(400, $exception->getStatusCode());
    }

    public function test_api_exception_custom_message()
    {
        $exception = new ApiException('Custom error message');

        $this->assertEquals('Custom error message', $exception->getMessage());
        $this->assertEquals(400, $exception->getStatusCode());
    }

    public function test_api_exception_custom_status_code()
    {
        $exception = new ApiException('Error', 404);

        $this->assertEquals('Error', $exception->getMessage());
        $this->assertEquals(404, $exception->getStatusCode());
    }

    public function test_api_exception_custom_message_and_status_code()
    {
        $exception = new ApiException('Not found', 404);

        $this->assertEquals('Not found', $exception->getMessage());
        $this->assertEquals(404, $exception->getStatusCode());
    }

    public function test_api_exception_with_previous_exception()
    {
        $previous = new \Exception('Previous error');
        $exception = new ApiException('Current error', 500, $previous);

        $this->assertEquals('Current error', $exception->getMessage());
        $this->assertEquals(500, $exception->getStatusCode());
        $this->assertEquals($previous, $exception->getPrevious());
    }
}
