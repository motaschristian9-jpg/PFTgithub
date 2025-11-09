<?php

namespace Tests\Unit\Scopes;

use App\Models\Transaction;
use App\Models\User;
use App\Scopes\UserScope;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_scope_applies_when_authenticated()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create transactions for both users
        Transaction::factory()->create(['user_id' => $user1->id]);
        Transaction::factory()->create(['user_id' => $user1->id]);
        Transaction::factory()->create(['user_id' => $user2->id]);

        // Authenticate as user1
        $this->actingAs($user1);

        // Query transactions - should only return user1's transactions
        $transactions = Transaction::all();

        $this->assertCount(2, $transactions);
        foreach ($transactions as $transaction) {
            $this->assertEquals($user1->id, $transaction->user_id);
        }
    }

    public function test_user_scope_does_not_apply_when_not_authenticated()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create transactions for both users
        Transaction::factory()->create(['user_id' => $user1->id]);
        Transaction::factory()->create(['user_id' => $user2->id]);

        // Don't authenticate - scope should not apply
        $transactions = Transaction::withoutGlobalScope(UserScope::class)->get();

        $this->assertCount(2, $transactions);
    }

    public function test_user_scope_can_be_removed()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create transactions for both users
        Transaction::factory()->create(['user_id' => $user1->id]);
        Transaction::factory()->create(['user_id' => $user2->id]);

        // Authenticate as user1
        $this->actingAs($user1);

        // Query without scope - should return all transactions
        $transactions = Transaction::withoutGlobalScope(UserScope::class)->get();

        $this->assertCount(2, $transactions);
    }
}
