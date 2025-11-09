<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Saving;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_fillable_attributes()
    {
        $fillable = ['name', 'email', 'password'];
        $this->assertEquals($fillable, (new User)->getFillable());
    }

    public function test_user_has_hidden_attributes()
    {
        $hidden = ['password', 'remember_token'];
        $this->assertEquals($hidden, (new User)->getHidden());
    }

    public function test_user_has_email_verified_at_cast()
    {
        $user = new User;
        $casts = $user->getCasts();
        $this->assertEquals('datetime', $casts['email_verified_at']);
    }

    public function test_user_has_password_hashed_cast()
    {
        $user = new User;
        $casts = $user->getCasts();
        $this->assertEquals('hashed', $casts['password']);
    }

    public function test_user_has_transactions_relationship()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(Transaction::class, $user->transactions->first());
        $this->assertEquals($transaction->id, $user->transactions->first()->id);
    }

    public function test_user_has_budgets_relationship()
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(Budget::class, $user->budgets->first());
        $this->assertEquals($budget->id, $user->budgets->first()->id);
    }

    public function test_user_has_savings_relationship()
    {
        $user = User::factory()->create();
        $saving = Saving::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(Saving::class, $user->savings->first());
        $this->assertEquals($saving->id, $user->savings->first()->id);
    }
}
