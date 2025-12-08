<?php

namespace Tests\Unit\Observers;

use App\Models\Saving;
use App\Models\User;
use App\Observers\SavingObserver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SavingObserverTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        // Register the observer
        Saving::observe(SavingObserver::class);
    }

    public function test_saving_created_clears_caches()
    {
        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        Saving::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_saving_updated_clears_caches()
    {
        $saving = Saving::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        $saving->update(['name' => 'Updated Saving']);
    }

    public function test_saving_deleted_clears_caches()
    {
        $saving = Saving::factory()->create(['user_id' => $this->user->id]);

        Cache::shouldReceive('tags')->with(['user_savings_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_transactions_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('tags')->with(['user_budgets_' . $this->user->id])->andReturnSelf();
        Cache::shouldReceive('flush')->atLeast()->times(1);

        $saving->delete();
    }
}