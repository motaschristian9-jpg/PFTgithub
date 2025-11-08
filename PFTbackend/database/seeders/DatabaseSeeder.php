<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Saving;
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
        // Create multiple users
        $users = User::factory(10)->create();

        // For each user, create associated data
        $users->each(function ($user) {
            // Create budgets for the user first
            $budgets = Budget::factory(3)->create([
                'user_id' => $user->id,
            ]);

            // Create transactions for the user, linking to budgets
            Transaction::factory(5)->create([
                'user_id' => $user->id,
                'category_id' => $budgets->random()->id, // Link to a random budget
            ]);

            // Create savings for the user
            Saving::factory(2)->create([
                'user_id' => $user->id,
            ]);
        });

        // Create a specific test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
