<?php

namespace Tests\Unit\Models;

use App\Models\Saving;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavingTest extends TestCase
{
    use RefreshDatabase;

    public function test_saving_has_fillable_attributes()
    {
        $fillable = ['user_id', 'name', 'target_amount', 'current_amount', 'description', 'target_date'];
        $this->assertEquals($fillable, (new Saving)->getFillable());
    }

    public function test_saving_has_casts()
    {
        $casts = [
            'id' => 'int',  // Laravel automatically casts 'id' to 'int' by default
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'target_date' => 'date',
        ];
        $this->assertEquals($casts, (new Saving)->getCasts());
    }

    public function test_saving_belongs_to_user()
    {
        $user = User::factory()->create();
        $saving = Saving::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $saving->user);
        $this->assertEquals($user->id, $saving->user->id);
    }
}
