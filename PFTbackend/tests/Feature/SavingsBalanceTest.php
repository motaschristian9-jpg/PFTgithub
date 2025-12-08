<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Saving;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingsBalanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_linked_to_saving_does_not_update_balance_by_default()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $saving = Saving::factory()->create([
            'user_id' => $user->id,
            'current_amount' => 0,
            'target_amount' => 1000
        ]);
        
        $category = Category::factory()->create(['type' => 'expense']);

        // Simulate "Quick Contribute" (Standard Expense Transaction linked to Goal)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/transactions', [
            'name' => 'Quick Contribute',
            'amount' => 50,
            'type' => 'expense',
            'date' => now()->toDateString(),
            'category_id' => $category->id,
            'saving_goal_id' => $saving->id,
            // NO savings_amount (this triggers standard flow, whichObserver should catch)
        ]);

        $response->assertCreated();

        // Reload saving
        $saving->refresh();

        // EXPECTED BEHAVIOR: Balance should be 50 (0 + 50) due to Observer recalculation
        $this->assertEquals(50, $saving->current_amount, "Balance should be updated by Observer!");
    }
}
