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
            'name' => 'Test Name',
            'category_id' => null,
        ]);

        $resource = new TransactionResource($transaction);
        $result = $resource->response()->getData(true);
        // dump($result['data']);

        $expected = [
            'id' => $transaction->id,
            'user_id' => $user->id,
            'name' => 'Test Name',
            'type' => 'expense',
            'amount' => 100.5,
            'description' => 'Test transaction',
            'date' => '2024-01-15',
            'category_id' => null,
            'category_name' => null,
            'budget_id' => null,
            'created_at' => $transaction->created_at->toISOString(),
            'updated_at' => $transaction->updated_at->toISOString(),
        ];

        $this->assertEquals($expected, $result['data']);
    }

    public function test_transaction_resource_with_null_description()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'description' => null,
        ]);

        $resource = new TransactionResource($transaction);
        $result = $resource->response()->getData(true);

        $this->assertNull($result['data']['description']);
    }

    public function test_transaction_resource_with_null_category_id()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'category_id' => null,
        ]);

        $resource = new TransactionResource($transaction);
        $result = $resource->response()->getData(true);

        $this->assertNull($result['data']['category_id']);
    }
}
