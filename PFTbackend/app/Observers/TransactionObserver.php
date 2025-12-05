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
    public function created(Transaction $transaction): void
    {
        $this->checkBudgetStatus($transaction->budget_id);
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
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->checkBudgetStatus($transaction->budget_id);
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
            // If it was reached but now isn't (e.g. transaction deleted or amount reduced)
            // We should revert to active, BUT only if dates are still valid.
            // BudgetObserver::updateStatus handles date logic, but we need to trigger it.
            // Simplest way: set to active if currently reached.
            if ($budget->status === 'reached') {
                 $budget->update(['status' => 'active']);
            }
        }
    }
}
