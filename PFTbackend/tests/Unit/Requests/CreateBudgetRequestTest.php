<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\CreateBudgetRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionClass;  // Add this import for reflection
use Tests\TestCase;

class CreateBudgetRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_budget_request_authorization()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new CreateBudgetRequest();
        $this->assertTrue($request->authorize());
    }

    public function test_create_budget_request_validation_rules()
    {
        $request = new CreateBudgetRequest();
        $rules = $request->rules();

        $expectedRules = [
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category_id' => 'nullable|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ];

        $this->assertEquals($expectedRules, $rules);
    }

    public function test_create_budget_request_valid_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $data = [
            'name' => 'Monthly Budget',
            'amount' => 500.00,
            'category_id' => 1,
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
        ];

        $request = new CreateBudgetRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $validator = app('validator')->make($data, $request->rules());
        $this->assertTrue($validator->passes());
    }

    public function test_create_budget_request_invalid_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $data = [
            'name' => '',
            'amount' => -100,
            'category_id' => 'not_integer',
            'start_date' => '',  // Fix: Make start_date invalid (empty string) so it triggers a required error
            'end_date' => '2023-12-31', // Before start_date (but since start_date is invalid, end_date might not validate fully, but keep for completeness)
        ];

        $request = new CreateBudgetRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $validator = app('validator')->make($data, $request->rules());
        $this->assertFalse($validator->passes());
        $this->assertArrayHasKey('name', $validator->errors()->toArray());
        $this->assertArrayHasKey('amount', $validator->errors()->toArray());
        $this->assertArrayHasKey('category_id', $validator->errors()->toArray());
        $this->assertArrayHasKey('start_date', $validator->errors()->toArray());  // Now start_date is invalid (required but empty)
        $this->assertArrayHasKey('end_date', $validator->errors()->toArray());
    }

    public function test_create_budget_request_prepare_for_validation()
    {
        $data = [
            'name' => '  <script>Test Budget</script>  ',
            'amount' => 500.00,
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
        ];

        $request = new CreateBudgetRequest();
        $request->merge($data);

        // Use reflection to access and invoke the protected prepareForValidation method
        $reflection = new ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        // Now assert that the name has been cleaned
        $this->assertEquals('Test Budget', $request->input('name'));
    }
}