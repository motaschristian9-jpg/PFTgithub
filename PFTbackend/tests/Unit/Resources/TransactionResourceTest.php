<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_resource_to_array()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'expense',
            'amount' => 100.50,
            'description' => 'Test transaction',
            'date' => '2024-01-15',
            'category_id' => null,
        ]);

        $resource = new TransactionResource($transaction);
        $result = $resource->toArray(request());

        $expected = [
            'id' => $transaction->id,
            'user_id' => $user->id,
            'type' => 'expense',
            'amount' => '100.50',
            'description' => 'Test transaction',
            'date' => '2024-01-15',
            'category_id' => null,
            'created_at' => $transaction->created_at,
            'updated_at' => $transaction->updated_at,
        ];

        $this->assertEquals($expected, $result);
    }

    public function test_transaction_resource_with_null_description()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'description' => null,
        ]);

        $resource = new TransactionResource($transaction);
        $result = $resource->toArray(request());

        $this->assertNull($result['description']);
    }

    public function test_transaction_resource_with_null_category_id()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'category_id' => null,
        ]);

        $resource = new TransactionResource($transaction);
        $result = $resource->toArray(request());

        $this->assertNull($result['category_id']);
    }
}
