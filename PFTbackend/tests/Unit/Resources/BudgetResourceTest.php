<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Models\User;
use App\Models\Transaction;  // Add this import
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_budget_resource_to_array()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'name' => 'Monthly Budget',
            'amount' => 500.00,
            'category_id' => 1,
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
        ]);

        // Load the transactions relationship to avoid MissingValue
        $budget->load('transactions');

        $resource = new BudgetResource($budget);
        $result = $resource->toArray(request());

        $expected = [
            'id' => $budget->id,
            'user_id' => $user->id,
            'name' => 'Monthly Budget',
            'amount' => '500.00',  // Amount is returned as a string (likely due to model casting or resource formatting)
            'category_id' => 1,
            'start_date' => '2024-01-01',
            'end_date' => '2024-01-31',
            'created_at' => $budget->created_at,  // Expect Carbon object, not ISO string
            'updated_at' => $budget->updated_at,  // Expect Carbon object, not ISO string
            'transactions' => $budget->transactions,  // Expect the loaded Collection (empty in this case)
        ];

        $this->assertEquals($expected, $result);
    }

    public function test_budget_resource_with_null_category_id()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => null,
        ]);

        $resource = new BudgetResource($budget);
        $result = $resource->toArray(request());

        $this->assertNull($result['category_id']);
    }

    public function test_budget_resource_with_loaded_transactions()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        // Create the transaction manually to ensure budget_id is set correctly (linking to budget)
        $transaction = new Transaction([
            'user_id' => $user->id,
            'budget_id' => $budget->id,  // Link to the budget
            'type' => 'expense',
            'amount' => 100.00,
            'description' => 'Test transaction',
            'date' => now()->toDateString(),
        ]);
        $transaction->save();

        // Refresh the budget and load transactions
        $budget->refresh();
        $budget->load('transactions');

        $resource = new BudgetResource($budget);
        $result = $resource->toArray(request());

        // Assert that transactions is a collection with 1 item
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result['transactions']);
        $this->assertCount(1, $result['transactions']);
        $this->assertEquals($transaction->id, $result['transactions'][0]['id']);
    }
}