<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Models\Saving;
use App\Models\Summary;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateMonthlySummaries extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'summaries:generate {--month= : Month to generate summaries for (1-12)} {--year= : Year to generate summaries for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly financial summaries for all users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $month = $this->option('month') ?: now()->month;
        $year = $this->option('year') ?: now()->year;

        $this->info("Generating summaries for {$month}/{$year}");

        $users = User::all();
        $progressBar = $this->output->createProgressBar($users->count());
        $progressBar->start();

        foreach ($users as $user) {
            $this->generateUserSummary($user, $month, $year);
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('Monthly summaries generated successfully!');
    }

    private function generateUserSummary(User $user, int $month, int $year)
    {
        // Calculate total income and expenses for the month
        $transactions = Transaction::where('user_id', $user->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');

        // Calculate budget performance
        $budgets = Budget::where('user_id', $user->id)
            ->where(function ($query) use ($month, $year) {
                $query->where(function ($q) use ($month, $year) {
                    $q->whereYear('start_date', '<=', $year)
                      ->whereMonth('start_date', '<=', $month)
                      ->whereYear('end_date', '>=', $year)
                      ->whereMonth('end_date', '>=', $month);
                });
            })
            ->get();

        $budgetPerformance = null;
        if ($budgets->isNotEmpty()) {
            $totalBudgetAmount = $budgets->sum('amount');
            $budgetPerformance = $totalBudgetAmount > 0 ? (($totalBudgetAmount - $totalExpenses) / $totalBudgetAmount) * 100 : 0;
            $budgetPerformance = max(0, min(100, $budgetPerformance)); // Clamp between 0-100
        }

        // Calculate savings progress
        $savings = Saving::where('user_id', $user->id)->get();
        $savingsProgress = null;
        if ($savings->isNotEmpty()) {
            $totalTarget = $savings->sum('target_amount');
            $totalCurrent = $savings->sum('current_amount');
            $savingsProgress = $totalTarget > 0 ? ($totalCurrent / $totalTarget) * 100 : 0;
            $savingsProgress = min(100, $savingsProgress); // Cap at 100%
        }

        // Prepare details
        $details = [
            'transaction_count' => $transactions->count(),
            'income_count' => $transactions->where('type', 'income')->count(),
            'expense_count' => $transactions->where('type', 'expense')->count(),
            'budget_count' => $budgets->count(),
            'saving_count' => $savings->count(),
        ];

        // Create or update summary
        Summary::updateOrCreate(
            [
                'user_id' => $user->id,
                'month' => $month,
                'year' => $year,
            ],
            [
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'budget_performance' => $budgetPerformance,
                'savings_progress' => $savingsProgress,
                'details' => $details,
            ]
        );
    }
}
