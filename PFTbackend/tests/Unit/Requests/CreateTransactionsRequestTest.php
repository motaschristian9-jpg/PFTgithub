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
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date|before_or_equal:today',
            'category_id' => 'nullable|integer|exists:categories,id',
            'budget_id' => 'nullable|integer',
            'savings_amount' => 'nullable|numeric|min:0',
            'transfer_category_id' => 'nullable|integer|exists:categories,id',
            'saving_goal_id' => 'nullable|integer|exists:savings,id',
        ];

        $this->assertEquals($expectedRules, $rules);
    }

    public function test_create_transactions_request_valid_data()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user);

        $data = [
            'name' => 'Test Transaction',
            'type' => 'expense',
            'amount' => 100.50,
            'description' => 'Test transaction',
            'date' => now()->toDateString(),
            'category_id' => 1,
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



    // Removed the duplicate test_create_transactions_request_rules method, as it's identical to test_create_transactions_request_validation_rules
}