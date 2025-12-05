<?php

namespace App\Observers;

use App\Models\Saving;
use Illuminate\Support\Facades\Cache;

class SavingObserver
{
    /**
     * Handle the Saving "created" event.
     */
    public function created(Saving $saving): void
    {
        $this->clearCaches($saving);
    }

    /**
     * Handle the Saving "updated" event.
     */
    public function updated(Saving $saving): void
    {
        // Check if status changed to 'completed'
        if ($saving->isDirty('status') && $saving->status === 'completed') {
            $saving->user->notify(new \App\Notifications\SavingCompletedNotification($saving));
        }

        $this->clearCaches($saving);
    }

    /**
     * Handle the Saving "deleted" event.
     */
    public function deleted(Saving $saving): void
    {
        $this->clearCaches($saving);
    }

    /**
     * Handle the Saving "restored" event.
     */
    public function restored(Saving $saving): void
    {
        $this->clearCaches($saving);
    }

    /**
     * Handle the Saving "force deleted" event.
     */
    public function forceDeleted(Saving $saving): void
    {
        $this->clearCaches($saving);
    }

    /**
     * Clear relevant caches when a saving changes.
     */
    private function clearCaches(Saving $saving): void
    {
        $userId = $saving->user_id;

        // Clear saving caches
        Cache::tags(['user_savings_' . $userId])->flush();
    }
}
