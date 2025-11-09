<?php

namespace Tests\Unit\Observers;

use App\Models\Budget;
use App\Models\User;
use App\Observers\BudgetObserver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class BudgetObserverTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Register the observer
        Budget::observe(BudgetObserver::class);
    }

    public function test_budget_created_clears_caches()
    {
        $user = User::factory()->create();

        // Set some cache values
        Cache::put('user_' . $user->id . '_budgets_*', 'test_data', 60);
        Cache::put('user_' . $user->id . '_transactions_*', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary_*', 'test_data', 60);

        // Create a budget
        Budget::factory()->create(['user_id' => $user->id]);

        // Check that caches are cleared (using wildcard forget, so check if cache is empty)
        // Fix: Removed '|| true' and updated keys to match what was set (assuming observer clears these wildcard keys)
        $this->assertFalse(Cache::has('user_' . $user->id . '_budgets_*'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions_*'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary_*'));
    }

    public function test_budget_updated_clears_caches()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        // Set some cache values
        Cache::put('user_' . $user->id . '_budgets_*', 'test_data', 60);
        Cache::put('user_' . $user->id . '_transactions_*', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary_*', 'test_data', 60);

        // Update the budget
        $budget->update(['name' => 'Updated Budget']);

        // Check that caches are cleared (using wildcard forget, so check if cache is empty)
        // Fix: Removed '|| true' and updated keys to match what was set
        $this->assertFalse(Cache::has('user_' . $user->id . '_budgets_*'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions_*'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary_*'));
    }

    public function test_budget_deleted_clears_caches()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        // Set some cache values
        Cache::put('user_' . $user->id . '_budgets_*', 'test_data', 60);
        Cache::put('user_' . $user->id . '_transactions_*', 'test_data', 60);
        Cache::put('user_' . $user->id . '_monthly_summary_*', 'test_data', 60);

        // Delete the budget
        $budget->delete();

        // Check that caches are cleared (using wildcard forget, so check if cache is empty)
        // Fix: Removed '|| true' and updated keys to match what was set
        $this->assertFalse(Cache::has('user_' . $user->id . '_budgets_*'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_transactions_*'));
        $this->assertFalse(Cache::has('user_' . $user->id . '_monthly_summary_*'));
    }
}