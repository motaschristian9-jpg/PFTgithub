<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\CreateTransactionsRequest;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionClass;  // Add this import for reflection
use Tests\TestCase;

class CreateTransactionsRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_transactions_request_authorization()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new CreateTransactionsRequest();
        $this->assertTrue($request->authorize());
    }

    public function test_create_transactions_request_validation_rules()
    {
        $request = new CreateTransactionsRequest();
        $rules = $request->rules();

        $expectedRules = [
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'category_id' => 'nullable|exists:budgets,id',
        ];

        $this->assertEquals($expectedRules, $rules);
    }

    public function test_create_transactions_request_valid_data()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user);

        $data = [
            'type' => 'expense',
            'amount' => 100.50,
            'description' => 'Test transaction',
            'date' => '2024-01-15',
            'category_id' => $budget->id,
        ];

        $request = new CreateTransactionsRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $validator = app('validator')->make($data, $request->rules());
        $this->assertTrue($validator->passes());
    }

    public function test_create_transactions_request_invalid_data()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $data = [
            'type' => 'invalid_type',
            'amount' => -100,
            'description' => '',
            'date' => 'invalid_date',
            'category_id' => 999, // Non-existent budget
        ];

        $request = new CreateTransactionsRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        $validator = app('validator')->make($data, $request->rules());
        $this->assertFalse($validator->passes());
        $this->assertArrayHasKey('type', $validator->errors()->toArray());
        $this->assertArrayHasKey('amount', $validator->errors()->toArray());
        $this->assertArrayHasKey('date', $validator->errors()->toArray());
        $this->assertArrayHasKey('category_id', $validator->errors()->toArray());
    }

    public function test_create_transactions_request_prepare_for_validation()
    {
        $data = [
            'type' => 'expense',
            'amount' => 100.50,
            'description' => '  <script>Test</script>  ',
            'date' => '2024-01-15',
        ];

        $request = new CreateTransactionsRequest();
        $request->merge($data);
        $request->setContainer(app());
        $request->setRedirector(app('redirect'));

        // Use reflection to access and invoke the protected prepareForValidation method
        $reflection = new ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        $this->assertEquals('Test', $request->input('description'));
    }

    // Removed the duplicate test_create_transactions_request_rules method, as it's identical to test_create_transactions_request_validation_rules
}