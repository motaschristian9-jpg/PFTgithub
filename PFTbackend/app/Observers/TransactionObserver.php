<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Models\Budget;
use Illuminate\Support\Facades\Log;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->checkBudgetStatus($transaction->budget_id);
        $this->checkSavingBalance($transaction);
        $this->clearCaches($transaction);
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        // Check both old and new budget IDs if changed
        if ($transaction->isDirty('budget_id')) {
            $this->checkBudgetStatus($transaction->getOriginal('budget_id'));
        }
        $this->checkBudgetStatus($transaction->budget_id);
        
        // Also check if amount changed, which might affect the budget status
        if ($transaction->isDirty('amount') && !$transaction->isDirty('budget_id')) {
             $this->checkBudgetStatus($transaction->budget_id);
        }

        // Check savings balance if relevant fields changed
        if ($transaction->isDirty(['amount', 'saving_goal_id', 'type'])) {
            $this->checkSavingBalance($transaction);
            if ($transaction->isDirty('saving_goal_id') && $transaction->getOriginal('saving_goal_id')) {
                // Update the old saving goal as well if it was moved
                $this->checkSavingBalance(Transaction::make([
                    'saving_goal_id' => $transaction->getOriginal('saving_goal_id'),
                    'user_id' => $transaction->user_id
                ]));
            }
        }

        $this->clearCaches($transaction);
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->checkBudgetStatus($transaction->budget_id);
        $this->checkSavingBalance($transaction);
        $this->clearCaches($transaction);
    }

    /**
     * Check and update the budget status.
     */
    private function checkBudgetStatus($budgetId): void
    {
        if (!$budgetId) {
            return;
        }

        $budget = Budget::withSum(['transactions' => function ($q) {
            $q->where('type', 'expense');
        }], 'amount')->find($budgetId);

        if (!$budget) {
            return;
        }

        $totalSpent = $budget->transactions_sum_amount ?? 0;

        if ($totalSpent >= $budget->amount) {
            if ($budget->status !== 'reached') {
                $budget->update(['status' => 'reached']);
            }
        } else {
            // Revert strict reached status if valid
            if ($budget->status === 'reached') {
                 $budget->update(['status' => 'active']);
            }

            // Check for 85% Warning
            $ratio = $budget->amount > 0 ? ($totalSpent / $budget->amount) : 0;
            $cacheKey = 'budget_warning_sent_' . $budget->id;

            if ($ratio >= 0.85) {
                if (!\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                    $budget->user->notify(new \App\Notifications\BudgetWarningNotification($budget));
                    // Cache for 7 days to avoid repeating the same warning too often for the same cycle
                    \Illuminate\Support\Facades\Cache::put($cacheKey, true, 86400 * 7); 
                }
            } else {
                // If balance drops below 85%, reset the warning trigger
                \Illuminate\Support\Facades\Cache::forget($cacheKey);
            }
        }
    }

    /**
     * Check and update the saving goal balance.
     */
    private function checkSavingBalance($transaction): void
    {
        if (!$transaction->saving_goal_id) {
            return;
        }

        $saving = \App\Models\Saving::find($transaction->saving_goal_id);
        if (!$saving) {
            return;
        }

        // Calculate total balance using efficient database aggregation instead of loading all rows
        $balance = \App\Models\Transaction::where('saving_goal_id', $saving->id)
            ->where('user_id', $transaction->user_id)
            ->sum(\Illuminate\Support\Facades\DB::raw("CASE WHEN type = 'expense' THEN amount WHEN type = 'income' THEN -amount ELSE 0 END"));

        // Ensure balance doesn't go below 0
        $balance = max(0, $balance);

        if ($saving->current_amount != $balance) {
            $saving->current_amount = $balance;
            
            // Auto-complete check
            $shouldNotifyCompleted = false;
            
            if ($balance >= $saving->target_amount) {
                if ($saving->status !== 'completed') {
                    $saving->status = 'completed';
                    $shouldNotifyCompleted = true;
                }
            } elseif ($saving->status === 'completed' && $balance < $saving->target_amount) {
                $saving->status = 'active';
            }
            
            // SAVE FIRST to ensure DB has correct amount before Notification Job runs
            $saving->saveQuietly();

            // Trigger Completion Notification
            if ($shouldNotifyCompleted) {
                 $saving->user->notify(new \App\Notifications\SavingCompletedNotification($saving));
            }

            // Check for 85% Warning
            $ratio = $saving->target_amount > 0 ? ($balance / $saving->target_amount) : 0;
            $cacheKey = 'saving_warning_sent_' . $saving->id;

            if ($ratio >= 0.85 && $ratio < 1.0) {
                if (!\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                    $saving->user->notify(new \App\Notifications\SavingWarningNotification($saving));
                    // Cache for 7 days
                    \Illuminate\Support\Facades\Cache::put($cacheKey, true, 86400 * 7);
                }
            } elseif ($ratio < 0.85) {
                \Illuminate\Support\Facades\Cache::forget($cacheKey);
            }
        }
    }

    /**
     * Clear relevant caches when a transaction changes.
     */
    private function clearCaches(Transaction $transaction): void
    {
        $userId = $transaction->user_id;

        // Clear transactions list
        \Illuminate\Support\Facades\Cache::tags(['user_transactions_' . $userId])->flush();

        // Clear budgets list because budgets calculate 'total spent' from transactions
        \Illuminate\Support\Facades\Cache::tags(['user_budgets_' . $userId])->flush();

        // Clear savings list because transactions can update savings balances
        \Illuminate\Support\Facades\Cache::tags(['user_savings_' . $userId])->flush();
    }
}
