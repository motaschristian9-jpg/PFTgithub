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
        // Check if status changed to 'reached'
        if ($budget->isDirty('status') && $budget->status === 'reached') {
            $budget->user->notify(new \App\Notifications\BudgetCompletedNotification($budget));
        }

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
     * Update the budget status based on dates.
     */
    private function updateStatus(Budget $budget): void
    {
        // If already reached or expired, don't revert to active unless dates changed significantly
        // For now, let's just ensure we don't overwrite 'reached' if dates are valid
        if ($budget->status === 'reached') {
            return;
        }

        $now = now()->toDateString();

        if ($budget->start_date > $now) {
            $budget->status = 'active'; 
        } elseif ($budget->end_date < $now) {
            $budget->status = 'expired';
        } else {
            // Only set to active if it wasn't already something else (like reached)
            // But here we are in a helper that enforces date logic.
            // If it was 'reached', we returned early above.
            $budget->status = 'active';
        }

        if ($budget->isDirty('status')) {
            $budget->saveQuietly();
        }
    }

    /**
     * Clear relevant caches when a budget changes.
     */
    private function clearCaches(Budget $budget): void
    {
        $userId = $budget->user_id;

        // Clear budget caches
        Cache::tags(['user_budgets_' . $userId])->flush();

        // Clear transaction caches since budgets are linked to transactions via category_id
        Cache::tags(['user_transactions_' . $userId])->flush();
    }
}
