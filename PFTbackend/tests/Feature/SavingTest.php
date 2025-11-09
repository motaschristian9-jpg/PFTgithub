<?php

namespace Tests\Feature;

use App\Models\Saving;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingTest extends TestCase
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

    public function test_user_can_list_savings()
    {
        Saving::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/savings');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'user_id',
                             'name',
                             'target_amount',
                             'current_amount',
                         ],
                     ],
                     'links',
                     'meta',
                 ]);
    }

    public function test_user_can_create_saving()
    {
        $savingData = [
            'name' => 'Emergency Fund',
            'target_amount' => 5000.00,
            'current_amount' => 1000.00,
            'description' => 'For unexpected expenses',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/savings', $savingData);

        $response->assertStatus(201)
                 ->assertJson([
                     'data' => [
                         'user_id' => $this->user->id,
                         'name' => 'Emergency Fund',
                         'target_amount' => '5000.00',
                         'current_amount' => '1000.00',
                         'description' => 'For unexpected expenses',
                     ]
                 ]);

        $this->assertDatabaseHas('savings', [
            'user_id' => $this->user->id,
            'name' => 'Emergency Fund',
        ]);
    }

    public function test_user_can_view_single_saving()
    {
        $saving = Saving::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/savings/' . $saving->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'id' => $saving->id,
                         'user_id' => $this->user->id,
                     ]
                 ]);
    }

    public function test_user_cannot_view_other_users_saving()
    {
        $otherUser = User::factory()->create();
        $saving = Saving::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/savings/' . $saving->id);

        $response->assertStatus(404);
    }

    public function test_user_can_update_saving()
    {
        $saving = Saving::factory()->create(['user_id' => $this->user->id]);

        $updateData = [
            'name' => 'Updated Emergency Fund',
            'target_amount' => 7500.00,
            'current_amount' => 2000.00,
            'description' => 'Updated description',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/savings/' . $saving->id, $updateData);

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'name' => 'Updated Emergency Fund',
                         'target_amount' => '7500.00',
                         'current_amount' => '2000.00',
                         'description' => 'Updated description',
                     ]
                 ]);

        $this->assertDatabaseHas('savings', [
            'id' => $saving->id,
            'name' => 'Updated Emergency Fund',
        ]);
    }

    public function test_user_can_delete_saving()
    {
        $saving = Saving::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson('/api/savings/' . $saving->id);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Saving deleted successfully.',
                 ]);

        $this->assertDatabaseMissing('savings', [
            'id' => $saving->id,
        ]);
    }

    public function test_saving_filtering_by_name()
    {
        Saving::factory()->create(['user_id' => $this->user->id, 'name' => 'Emergency Fund']);
        Saving::factory()->create(['user_id' => $this->user->id, 'name' => 'Vacation Fund']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/savings?name=Emergency');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Emergency Fund', $data[0]['name']);
    }

    public function test_saving_validation_fails()
    {
        $invalidData = [
            'name' => '', // Required field empty
            'target_amount' => -1000, // Invalid negative amount
            'current_amount' => -500, // Invalid negative amount
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/savings', $invalidData);

        $response->assertStatus(422);
    }
}
