<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class UpdateBudgetStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'budgets:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update status of budgets (expired, reached) based on current date and spending';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting budget status updates...');
        
        $today = Carbon::now()->format('Y-m-d');

        // 1. Expire outdated budgets
        // We fetch distinct user IDs to clear cache later
        $expiredBudgets = Budget::where('status', 'active')
            ->where('end_date', '<', $today)
            ->get();

        $userIdsToClear = [];

        foreach ($expiredBudgets as $budget) {
            $budget->update(['status' => 'expired']);
            $userIdsToClear[$budget->user_id] = true;
            $this->info("Budget ID {$budget->id} expired.");
        }

        // 2. Check for reached budgets
        // Find active budgets where total spent >= allocated amount
        $budgetsToCheck = Budget::where('status', 'active')
            ->withSum('transactions', 'amount')
            ->get();

        foreach ($budgetsToCheck as $budget) {
            // transactions_sum_amount is added by withSum
            if (($budget->transactions_sum_amount ?? 0) >= $budget->amount) {
                $budget->update(['status' => 'reached']);
                $userIdsToClear[$budget->user_id] = true;
                $this->info("Budget ID {$budget->id} reached limit.");
            }
        }

        // 3. Clear cache for affected users
        foreach (array_keys($userIdsToClear) as $userId) {
            $this->clearUserCache($userId);
            $this->info("Cleared cache for User ID {$userId}.");
        }

        $this->info('Budget status updates completed.');
    }

    private function clearUserCache($userId)
    {
        // Clear budget list
        Cache::tags(['user_budgets_' . $userId])->flush();
        // Clear transaction list because budget status changes might affect UI
        Cache::tags(['user_transactions_' . $userId])->flush();
    }
}
