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
        $category = \App\Models\Category::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'name' => 'Monthly Budget',
            'amount' => 500.00,
            'category_id' => $category->id,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
            'status' => 'active',
        ]);

        $resource = new BudgetResource($budget);
        $result = $resource->response()->getData(true);

        $expected = [
            'id' => $budget->id,
            'user_id' => $user->id,
            'name' => 'Monthly Budget',
            'amount' => '500.00',
            'category_id' => $category->id,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
            'status' => 'active',
            'total_spent' => 0,
            'created_at' => $budget->created_at->toISOString(),
            'updated_at' => $budget->updated_at->toISOString(),
        ];
        
        // Use 'data' key if resource is not wrapped, but JsonResource usually wraps in data unless turned off.
        // check $result structure. usually ['data' => ...]
        $this->assertEquals($expected, $result['data']);
    }

    public function test_budget_resource_with_null_category_id()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => null,
        ]);

        $resource = new BudgetResource($budget);
        $result = $resource->response()->getData(true);

        $this->assertNull($result['data']['category_id']);
    }

    public function test_budget_resource_with_loaded_transactions()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        // Create the transaction manually to ensure budget_id is set correctly (linking to budget)
        $transaction = new Transaction([
            'user_id' => $user->id,
            'budget_id' => $budget->id,  // Link to the budget
            'name' => 'Test Transaction',
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
        $result = $resource->response()->getData(true);

        // Assert that transactions is present and is an array (resource collection converted to array)
        $this->assertIsArray($result['data']['transactions']);
        $this->assertCount(1, $result['data']['transactions']);
    }
}