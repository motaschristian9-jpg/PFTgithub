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

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        // Register the observer if not automatically discovered
        // Budget::observe(BudgetObserver::class);
    }

    public function test_budget_created_clears_caches()
    {
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->times(2);

        Budget::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_budget_updated_clears_caches()
    {
        $budget = Budget::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        $budget->update(['name' => 'Updated Budget']);
    }

    public function test_budget_deleted_clears_caches()
    {
        $budget = Budget::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        $budget->delete();
    }
}