<?php

namespace Tests\Unit\Models;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Budget;
use App\Scopes\UserScope;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_has_fillable_attributes()
    {
        $fillable = ['user_id', 'name', 'type', 'amount', 'description', 'date', 'category_id', 'budget_id', 'saving_goal_id'];
        $this->assertEquals($fillable, (new Transaction)->getFillable());
    }

    public function test_transaction_has_casts()
    {
        $casts = [
            'id' => 'int',  // Laravel automatically casts 'id' to 'int' by default
            'amount' => 'decimal:2',
            'date' => 'date',
        ];
        $this->assertEquals($casts, (new Transaction)->getCasts());
    }

    public function test_transaction_has_user_scope_applied()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Transaction::factory()->create(['user_id' => $user1->id]);
        Transaction::factory()->create(['user_id' => $user2->id]);

        // When querying as user1, should only see their transactions
        $this->actingAs($user1);
        $transactions = Transaction::all();
        $this->assertCount(1, $transactions);
        $this->assertEquals($user1->id, $transactions->first()->user_id);
    }

    public function test_transaction_belongs_to_user()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $transaction->user);
        $this->assertEquals($user->id, $transaction->user->id);
    }

    public function test_transaction_belongs_to_budget()
    {
        $user = User::factory()->create();
        $budget = \App\Models\Budget::withoutEvents(function () use ($user) {
             return Budget::factory()->create(['user_id' => $user->id]);
        });
        $transaction = \App\Models\Transaction::withoutEvents(function () use ($user, $budget) {
            return Transaction::factory()->create(['user_id' => $user->id, 'budget_id' => $budget->id]);
        });

        $this->assertInstanceOf(Budget::class, $transaction->budget);
        $this->assertEquals($budget->id, $transaction->budget_id);
    }
}
