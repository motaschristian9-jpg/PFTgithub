<?php

namespace App\Observers;

use App\Models\Budget;
use Illuminate\Support\Facades\Cache;

class BudgetObserver
{
    /**
     * Handle the Budget "created" event.
     */
    public function created(Budget $budget): void
    {
        $this->updateStatus($budget);
        $this->clearCaches($budget);
    }

    /**
     * Handle the Budget "updated" event.
     */
    public function updated(Budget $budget): void
    {
        $this->updateStatus($budget);
        $this->clearCaches($budget);
    }

    /**
     * Handle the Budget "deleted" event.
     */
    public function deleted(Budget $budget): void
    {
        $this->clearCaches($budget);
    }

    /**
     * Handle the Budget "restored" event.
     */
    public function restored(Budget $budget): void
    {
        $this->clearCaches($budget);
    }

    /**
     * Handle the Budget "force deleted" event.
     */
    public function forceDeleted(Budget $budget): void
    {
        $this->clearCaches($budget);
    }

    /**
     * Update the budget status based on dates.
     */
    private function updateStatus(Budget $budget): void
    {
        $now = now()->toDateString();

        if ($budget->start_date > $now) {
            $budget->status = 'active'; // or 'upcoming' if needed, but user said active, completed, expired
        } elseif ($budget->end_date < $now) {
            $budget->status = 'expired';
        } else {
            $budget->status = 'active';
        }

        $budget->saveQuietly(); // Save without triggering events
    }

    /**
     * Clear relevant caches when a budget changes.
     */
    private function clearCaches(Budget $budget): void
    {
        $userId = $budget->user_id;

        // Clear budget caches
        Cache::forget('user_' . $userId . '_budgets_*');

        // Clear transaction caches since budgets are linked to transactions via category_id
        Cache::forget('user_' . $userId . '_transactions_*');

        // Clear monthly summary caches
        Cache::forget('user_' . $userId . '_monthly_summary_*');
    }
}
