<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Saving;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Categories
        $categories = [
            // Income Categories
            ['name' => 'Salary', 'type' => 'income'],
            ['name' => 'Freelance', 'type' => 'income'],
            ['name' => 'Business', 'type' => 'income'],
            ['name' => 'Investment', 'type' => 'income'],
            ['name' => 'Rental', 'type' => 'income'],
            ['name' => 'Gift', 'type' => 'income'],
            ['name' => 'Bonus', 'type' => 'income'],
            ['name' => 'Other', 'type' => 'income'],

            // Expense Categories
            ['name' => 'Food', 'type' => 'expense'],
            ['name' => 'Transport', 'type' => 'expense'],
            ['name' => 'Shopping', 'type' => 'expense'],
            ['name' => 'Bills', 'type' => 'expense'],
            ['name' => 'Healthcare', 'type' => 'expense'],
            ['name' => 'Other', 'type' => 'expense'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // 2. Create Single User Account
        $user = User::create([
            'name' => 'Christian Orlan Motas',
            'email' => 'motas.christian9@gmail.com',
            'password' => Hash::make('Nixchan19'),
            'login_method' => 'email',
            'currency' => 'PHP',
            'email_verified_at' => now(),
        ]);

        // 3. Create Budgets (Active & Inactive for ALL Expense Categories)
        $expenseCategories = Category::where('type', 'expense')->get();

        foreach ($expenseCategories as $category) {
            // Active Budget
            Budget::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'name' => $category->name . ' Budget',
                'amount' => rand(5000, 20000),
                'start_date' => Carbon::now()->startOfMonth(),
                'end_date' => Carbon::now()->endOfMonth(),
                'status' => 'active',
            ]);

            // Inactive/History Budget (Last Month) - WITH TRANSACTIONS
            $historyBudgetAmount = rand(5000, 20000);
            $historyBudget = Budget::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'name' => $category->name . ' Budget (Last Month)',
                'amount' => $historyBudgetAmount,
                'start_date' => Carbon::now()->subMonth()->startOfMonth(),
                'end_date' => Carbon::now()->subMonth()->endOfMonth(),
                'status' => 'completed',
            ]);

            // Create 1-3 random transactions for this history budget to show usage
            $numTransactions = rand(1, 3);
            for ($i = 0; $i < $numTransactions; $i++) {
                Transaction::create([
                    'user_id' => $user->id,
                    'name' => 'Old ' . $category->name . ' Expense',
                    'type' => 'expense',
                    'amount' => rand(500, $historyBudgetAmount / 3), // Random amount
                    'description' => 'History transaction for budget',
                    'date' => Carbon::now()->subMonth()->addDays(rand(1, 25)), // Date within last month
                    'category_id' => $category->id,
                    'budget_id' => $historyBudget->id,
                ]);
            }
        }

        // 4. Create Savings Goals
        $savingsGoals = [
            [
                'name' => 'New Car Fund',
                'target_amount' => 500000,
                'current_amount' => 150000,
                'description' => 'Saving up for a Toyota Vios',
                'status' => 'active',
            ],
            [
                'name' => 'Emergency Fund',
                'target_amount' => 100000,
                'current_amount' => 80000,
                'description' => '3 months of expenses',
                'status' => 'active',
            ],
            [
                'name' => 'Japan Trip',
                'target_amount' => 150000,
                'current_amount' => 20000,
                'description' => 'Travel fund for next year',
                'status' => 'active',
            ],
            [
                'name' => 'New Laptop',
                'target_amount' => 60000,
                'current_amount' => 60000, // Fully funded
                'description' => 'MacBook Air M2',
                'status' => 'reached', // Completed goal
            ],
             [
                'name' => 'Gaming Console',
                'target_amount' => 30000,
                'current_amount' => 30000, // Fully funded
                'description' => 'PS5 Pro',
                'status' => 'reached', // Another completed goal
            ],
        ];

        foreach ($savingsGoals as $goal) {
            $saving = Saving::create(array_merge($goal, ['user_id' => $user->id]));

            // Add a contribution transaction for the FULL amount (or split bits)
            if ($goal['current_amount'] > 0) {
                // If it's a large amount, let's split it into a few deposits to look realistic
                $remaining = $goal['current_amount'];
                $chunks = rand(1, 3);
                
                for ($i = 0; $i < $chunks; $i++) {
                    $amount = ($i == $chunks - 1) ? $remaining : round($remaining / 2);
                    $remaining -= $amount;

                    Transaction::create([
                        'user_id' => $user->id,
                        'name' => 'Deposit to ' . $goal['name'],
                        'type' => 'expense',
                        'amount' => $amount,
                        'description' => 'Savings contribution',
                        'date' => Carbon::now()->subDays(rand(1, 60)),
                        'saving_goal_id' => $saving->id,
                    ]);
                }
            }
        }

        // 5. Create Realistic Transactions (20+) for Current Month
        $transactions = [
            // Income
            ['name' => 'Monthly Salary', 'type' => 'income', 'amount' => 45000, 'category' => 'Salary', 'date' => Carbon::now()->startOfMonth()->addDays(14)],
            ['name' => 'Freelance Project', 'type' => 'income', 'amount' => 15000, 'category' => 'Freelance', 'date' => Carbon::now()->subDays(5)],
            ['name' => 'Stock Dividend', 'type' => 'income', 'amount' => 2500, 'category' => 'Investment', 'date' => Carbon::now()->subDays(12)],
            
            // Expenses - Food
            ['name' => 'Grocery at SM', 'type' => 'expense', 'amount' => 3500, 'category' => 'Food', 'date' => Carbon::now()->subDays(2)],
            ['name' => 'Lunch at Jollibee', 'type' => 'expense', 'amount' => 250, 'category' => 'Food', 'date' => Carbon::now()->subDays(1)],
            ['name' => 'Dinner Date', 'type' => 'expense', 'amount' => 1500, 'category' => 'Food', 'date' => Carbon::now()->subDays(3)],
            ['name' => 'Coffee at Starbucks', 'type' => 'expense', 'amount' => 180, 'category' => 'Food', 'date' => Carbon::now()->subDays(4)],
            
            // Expenses - Transport
            ['name' => 'Gas Refill', 'type' => 'expense', 'amount' => 2000, 'category' => 'Transport', 'date' => Carbon::now()->subDays(6)],
            ['name' => 'Grab Ride', 'type' => 'expense', 'amount' => 450, 'category' => 'Transport', 'date' => Carbon::now()->subDays(2)],
            ['name' => 'Car Wash', 'type' => 'expense', 'amount' => 150, 'category' => 'Transport', 'date' => Carbon::now()->subDays(10)],

            // Expenses - Bills
            ['name' => 'Meralco Bill', 'type' => 'expense', 'amount' => 4500, 'category' => 'Bills', 'date' => Carbon::now()->subDays(15)],
            ['name' => 'Internet Bill', 'type' => 'expense', 'amount' => 1699, 'category' => 'Bills', 'date' => Carbon::now()->subDays(16)],
            ['name' => 'Water Bill', 'type' => 'expense', 'amount' => 500, 'category' => 'Bills', 'date' => Carbon::now()->subDays(15)],
            ['name' => 'Netflix Subscription', 'type' => 'expense', 'amount' => 549, 'category' => 'Bills', 'date' => Carbon::now()->subDays(20)],

            // Expenses - Shopping
            ['name' => 'New T-Shirt', 'type' => 'expense', 'amount' => 800, 'category' => 'Shopping', 'date' => Carbon::now()->subDays(8)],
            ['name' => 'Shopee Order', 'type' => 'expense', 'amount' => 1200, 'category' => 'Shopping', 'date' => Carbon::now()->subDays(9)],
            ['name' => 'Lazada Sale', 'type' => 'expense', 'amount' => 2500, 'category' => 'Shopping', 'date' => Carbon::now()->subDays(25)],

            // Expenses - Healthcare
            ['name' => 'Vitamins', 'type' => 'expense', 'amount' => 1500, 'category' => 'Healthcare', 'date' => Carbon::now()->subDays(18)],
            ['name' => 'Dental Checkup', 'type' => 'expense', 'amount' => 2000, 'category' => 'Healthcare', 'date' => Carbon::now()->subDays(28)],

            // More Random Expenses to hit 20+
            ['name' => 'Cinema Tickets', 'type' => 'expense', 'amount' => 800, 'category' => 'Other', 'date' => Carbon::now()->subDays(7)],
            ['name' => 'Parking Fee', 'type' => 'expense', 'amount' => 50, 'category' => 'Transport', 'date' => Carbon::now()->subDays(1)],
            ['name' => 'Snacks', 'type' => 'expense', 'amount' => 120, 'category' => 'Food', 'date' => Carbon::now()->subDays(0)],
        ];

        foreach ($transactions as $t) {
            $category = Category::where('name', $t['category'])->first();
            
            $budget_id = null;
            if ($t['type'] === 'expense') {
                // Find active budget for this category
                $budget = Budget::where('user_id', $user->id)
                    ->where('category_id', $category->id)
                    ->where('status', 'active')
                    ->first();
                $budget_id = $budget ? $budget->id : null;
            }

            Transaction::create([
                'user_id' => $user->id,
                'name' => $t['name'],
                'type' => $t['type'],
                'amount' => $t['amount'],
                'description' => 'Seeded transaction',
                'date' => $t['date'],
                'category_id' => $category->id,
                'budget_id' => $budget_id,
            ]);
        }
    }
}
