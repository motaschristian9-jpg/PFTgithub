<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\SavingResource;
use App\Models\Saving;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_saving_resource_to_array()
    {
        $user = User::factory()->create();
        $saving = Saving::factory()->create([
            'user_id' => $user->id,
            'name' => 'Emergency Fund',
            'target_amount' => 5000.00,
            'current_amount' => 1000.00,
            'description' => 'Building emergency savings',
        ]);

        $resource = new SavingResource($saving);
        $result = $resource->toArray(request());

        $expected = [
            'id' => $saving->id,
            'user_id' => $user->id,
            'name' => 'Emergency Fund',
            'target_amount' => '5000.00',
            'current_amount' => '1000.00',
            'description' => 'Building emergency savings',
            'target_date' => null,
            'created_at' => $saving->created_at,
            'updated_at' => $saving->updated_at,
        ];

        $this->assertEquals($expected, $result);
    }

    public function test_saving_resource_with_null_description()
    {
        $user = User::factory()->create();
        $saving = Saving::factory()->create([
            'user_id' => $user->id,
            'description' => null,
        ]);

        $resource = new SavingResource($saving);
        $result = $resource->toArray(request());

        $this->assertNull($result['description']);
    }
}
