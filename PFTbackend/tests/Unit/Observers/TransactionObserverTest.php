<?php

namespace Tests\Unit\Observers;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Budget;
use App\Observers\TransactionObserver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class TransactionObserverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Register the observer
        Transaction::observe(TransactionObserver::class);
    }

    public function test_transaction_created_clears_caches()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);  // Create a budget to satisfy foreign key

        // Set some cache values (use exact keys matching the observer)
        Cache::put('user_' . $user->id . '_transactions', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary', 'test_data', 60);
        Cache::put('user_' . $user->id . '_budgets', 'test_data', 60);

        // Create a transaction with category_id
        Transaction::factory()->create([
            'user_id' => $user->id,
            'category_id' => $budget->id,  // Use the created budget's ID
        ]);

        // Check that caches are cleared (use exact keys)
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_budgets'));  // Cleared because category_id is set
    }

    public function test_transaction_created_without_category_id_clears_caches()
    {
        $user = User::factory()->create();

        // Set some cache values (use exact keys)
        Cache::put('user_' . $user->id . '_transactions', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary', 'test_data', 60);
        Cache::put('user_' . $user->id . '_budgets', 'test_data', 60);

        // Create a transaction without category_id
        Transaction::factory()->create([
            'user_id' => $user->id,
            'category_id' => null,
        ]);

        // Check that transaction and summary caches are cleared, but not budget cache (matches observer logic)
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary'));
        $this->assertTrue(Cache::has('user_' . $user->id . '_budgets'));  // Not cleared because category_id is null
    }

    public function test_transaction_updated_clears_caches()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        // Set some cache values (use exact keys)
        Cache::put('user_' . $user->id . '_transactions', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary', 'test_data', 60);

        // Update the transaction
        $transaction->update(['description' => 'Updated transaction']);

        // Check that caches are cleared (use exact keys)
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary'));
    }

    public function test_transaction_deleted_clears_caches()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        // Set some cache values (use exact keys)
        Cache::put('user_' . $user->id . '_transactions', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary', 'test_data', 60);

        // Delete the transaction
        $transaction->delete();

        // Check that caches are cleared (use exact keys)
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary'));
    }
}