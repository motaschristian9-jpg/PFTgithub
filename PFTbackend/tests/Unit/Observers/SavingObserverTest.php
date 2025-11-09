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

    protected function setUp(): void
    {
        parent::setUp();
        // Register the observer
        Saving::observe(SavingObserver::class);
    }

    public function test_saving_created_clears_caches()
    {
        $user = User::factory()->create();

        // Set some cache values
        Cache::put('user_' . $user->id . '_savings_*', 'test_data', 60);

        // Create a saving
        Saving::factory()->create(['user_id' => $user->id]);

        // Check that caches are cleared (using wildcard forget, so check if cache is empty)
        // Fix: Removed '|| true' and updated key to match what was set
        $this->assertFalse(Cache::has('user_' . $user->id . '_savings_*'));
    }

    public function test_saving_updated_clears_caches()
    {
        $user = User::factory()->create();
        $saving = Saving::factory()->create(['user_id' => $user->id]);

        // Set some cache values
        Cache::put('user_' . $user->id . '_savings_*', 'test_data', 60);

        // Update the saving
        $saving->update(['name' => 'Updated Saving']);

        // Check that caches are cleared (using wildcard forget, so check if cache is empty)
        // Fix: Removed '|| true' and updated key to match what was set
        $this->assertFalse(Cache::has('user_' . $user->id . '_savings_*'));
    }

    public function test_saving_deleted_clears_caches()
    {
        $user = User::factory()->create();
        $saving = Saving::factory()->create(['user_id' => $user->id]);

        // Set some cache values
        Cache::put('user_' . $user->id . '_savings_*', 'test_data', 60);

        // Delete the saving
        $saving->delete();

        // Check that caches are cleared (using wildcard forget, so check if cache is empty)
        // Fix: Removed '|| true' and updated key to match what was set
        $this->assertFalse(Cache::has('user_' . $user->id . '_savings_*'));
    }
}