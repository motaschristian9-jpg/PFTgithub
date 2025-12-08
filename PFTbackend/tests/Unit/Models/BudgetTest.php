<?php

namespace Tests\Unit\Models;

use App\Models\Budget;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_budget_has_fillable_attributes()
    {
        $fillable = ['user_id', 'name', 'amount', 'start_date', 'end_date', 'category_id', 'status'];
        $this->assertEquals($fillable, (new Budget)->getFillable());
    }

    public function test_budget_has_casts()
    {
        $casts = [
            'id' => 'int',  // Laravel automatically casts 'id' to 'int' by default
            'amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
        $this->assertEquals($casts, (new Budget)->getCasts());
    }

    public function test_budget_belongs_to_user()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $budget->user);
        $this->assertEquals($user->id, $budget->user->id);
    }

    public function test_budget_has_many_transactions()
    {
        $user = User::factory()->create();
        $budget = \App\Models\Budget::withoutEvents(function () use ($user) {
            return Budget::factory()->create(['user_id' => $user->id]);
        });
        $transaction = \App\Models\Transaction::withoutEvents(function () use ($user, $budget) {
            return Transaction::factory()->create(['user_id' => $user->id, 'budget_id' => $budget->id]);
        });

        $this->assertInstanceOf(Transaction::class, $budget->transactions->first());
        $this->assertEquals($transaction->id, $budget->transactions->first()->id);
    }
}
