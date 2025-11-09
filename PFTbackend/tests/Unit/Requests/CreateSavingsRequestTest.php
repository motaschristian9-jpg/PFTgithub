<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\CreateSavingsRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionClass;  // Add this import for reflection
use Tests\TestCase;

class CreateSavingsRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_savings_request_authorization()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new CreateSavingsRequest();
        $this->assertTrue($request->authorize());
    }

    public function test_create_savings_request_validation_rules()
    {
        $request = new CreateSavingsRequest();
        $rules = $request->rules();

        $expectedRules = [
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
        ];

        $this->assertEquals($expectedRules, $rules);
    }

    public function test_create_savings_request_valid_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $data = [
            'name' => 'Emergency Fund',
            'target_amount' => 5000.00,
            'current_amount' => 1000.00,
            'description' => 'Building emergency savings',
        ];

        $request = new CreateSavingsRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $validator = app('validator')->make($data, $request->rules());
        $this->assertTrue($validator->passes());
    }

    public function test_create_savings_request_invalid_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $data = [
            'name' => '',
            'target_amount' => -100,
            'current_amount' => -50,
            'description' => '',
        ];

        $request = new CreateSavingsRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $validator = app('validator')->make($data, $request->rules());
        $this->assertFalse($validator->passes());
        $this->assertArrayHasKey('name', $validator->errors()->toArray());
        $this->assertArrayHasKey('target_amount', $validator->errors()->toArray());
        $this->assertArrayHasKey('current_amount', $validator->errors()->toArray());
    }

    public function test_create_savings_request_prepare_for_validation()
    {
        $data = [
            'name' => '  <script>Test Saving</script>  ',
            'target_amount' => 5000.00,
            'description' => '  <b>Description</b>  ',
        ];

        $request = new CreateSavingsRequest();
        $request->merge($data);

        // Use reflection to access and invoke the protected prepareForValidation method
        $reflection = new ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        // Now assert that the name and description have been cleaned
        $this->assertEquals('Test Saving', $request->input('name'));
        $this->assertEquals('Description', $request->input('description'));
    }
}