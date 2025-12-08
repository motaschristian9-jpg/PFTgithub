<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_user_can_list_budgets()
    {
        Budget::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/budgets');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'user_id',
                             'name',
                             'amount',
                             'start_date',
                             'end_date',
                         ],
                     ],
                 ]);
    }

    public function test_user_can_create_budget()
    {
        $category = \App\Models\Category::factory()->create();
        
        $budgetData = [
            'name' => 'Monthly Groceries Budget',
            'amount' => 500.00,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
            'category_id' => $category->id,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/budgets', $budgetData);

        $response->assertStatus(201)
                 ->assertJson([
                     'data' => [
                         'user_id' => $this->user->id,
                         'name' => 'Monthly Groceries Budget',
                         'amount' => '500.00',
                         'start_date' => now()->startOfMonth()->toDateString(),
                         'end_date' => now()->endOfMonth()->toDateString(),
                         'category_id' => $category->id,
                     ]
                 ]);

        $this->assertDatabaseHas('budgets', [
            'user_id' => $this->user->id,
            'name' => 'Monthly Groceries Budget',
        ]);
    }

    public function test_user_can_view_single_budget()
    {
        $budget = Budget::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/budgets/' . $budget->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'id' => $budget->id,
                         'user_id' => $this->user->id,
                     ]
                 ]);
    }

    public function test_user_cannot_view_other_users_budget()
    {
        $otherUser = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/budgets/' . $budget->id);

        $response->assertStatus(404);
    }

    public function test_user_can_update_budget()
    {
        $budget = Budget::factory()->create(['user_id' => $this->user->id]);

        $category = \App\Models\Category::factory()->create();
        
        $updateData = [
            'name' => 'Updated Budget Name',
            'amount' => 750.00,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
            'category_id' => $category->id,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/budgets/' . $budget->id, $updateData);

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'name' => 'Updated Budget Name',
                         'amount' => '750.00',
                         'start_date' => now()->startOfMonth()->toDateString(),
                         'end_date' => now()->endOfMonth()->toDateString(),
                         'category_id' => $category->id,
                     ]
                 ]);

        $this->assertDatabaseHas('budgets', [
            'id' => $budget->id,
            'name' => 'Updated Budget Name',
        ]);
    }

    public function test_user_can_delete_budget()
    {
        $budget = Budget::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson('/api/budgets/' . $budget->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ]);

        $this->assertDatabaseMissing('budgets', [
            'id' => $budget->id,
        ]);
    }

    public function test_budget_filtering_by_name()
    {
        Budget::factory()->create(['user_id' => $this->user->id, 'name' => 'Groceries Budget']);
        Budget::factory()->create(['user_id' => $this->user->id, 'name' => 'Entertainment Budget']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/budgets?search=Groceries');

        $response->assertStatus(200);
        // dump($response->json());
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Groceries Budget', $data[0]['name']);
    }

    public function test_budget_validation_fails()
    {
        $invalidData = [
            'name' => '', // Required field empty
            'amount' => -100, // Invalid negative amount
            'start_date' => '2024-01-31', // Start date after end date
            'end_date' => '2024-01-01',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/budgets', $invalidData);

        $response->assertStatus(422);
    }
}
