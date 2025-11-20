<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Saving;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create categories first
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

        // Create multiple users
        $users = User::factory(10)->create();

        // For each user, create associated data
        $users->each(function ($user) {
            // Create budgets for the user first
            $budgets = Budget::factory(3)->create([
                'user_id' => $user->id,
            ]);

            // Create transactions for the user, linking to categories
            Transaction::factory(5)->create([
                'user_id' => $user->id,
                'category_id' => Category::all()->random()->id, // Link to a random category
            ]);

            // Create savings for the user
            Saving::factory(2)->create([
                'user_id' => $user->id,
            ]);
        });

        // Create a specific test user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create transactions for the test user
        Transaction::factory(5)->create([
            'user_id' => $testUser->id,
            'category_id' => Category::all()->random()->id,
        ]);
    }
}
