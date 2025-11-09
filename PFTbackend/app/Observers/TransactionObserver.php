<?php

namespace App\Observers;

use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->clearCaches($transaction);
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        $this->clearCaches($transaction);
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->clearCaches($transaction);
    }

    /**
     * Handle the Transaction "restored" event.
     */
    public function restored(Transaction $transaction): void
    {
        $this->clearCaches($transaction);
    }

    /**
     * Handle the Transaction "force deleted" event.
     */
    public function forceDeleted(Transaction $transaction): void
    {
        $this->clearCaches($transaction);
    }

    /**
     * Clear relevant caches when a transaction changes.
     */
    private function clearCaches(Transaction $transaction): void
    {
        $userId = $transaction->user_id;

        // Clear transaction caches
        Cache::forget('user_' . $userId . '_transactions');

        // Clear monthly summary caches
        Cache::forget('user_' . $userId . '_monthly_summary');

        // Clear budget caches if transaction has a category_id (linked to budget)
        if ($transaction->category_id) {
            Cache::forget('user_' . $userId . '_budgets');
        }
    }
}
