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
        $this->clearCaches($budget);
    }

    /**
     * Handle the Budget "updated" event.
     */
    public function updated(Budget $budget): void
    {
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
