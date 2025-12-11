<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
            // Use firstOrCreate to prevent duplicates if run multiple times
            Category::firstOrCreate(
                ['name' => $category['name'], 'type' => $category['type']],
                ['name' => $category['name'], 'type' => $category['type']]
            );
        }
    }
}
