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

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        // Register the observer
        Transaction::observe(TransactionObserver::class);
    }

    public function test_transaction_created_clears_caches()
    {
        $budget = Budget::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $budget->category_id,
        ]);
    }

    public function test_transaction_created_without_category_id_clears_caches()
    {
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => null,
        ]);
    }

    public function test_transaction_updated_clears_caches()
    {
        $transaction = Transaction::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        $transaction->update(['description' => 'Updated transaction']);
    }

    public function test_transaction_deleted_clears_caches()
    {
        $transaction = Transaction::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        $transaction->delete();
    }
}