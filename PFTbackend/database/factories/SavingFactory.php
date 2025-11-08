<?php

namespace Database\Factories;

use App\Models\Saving;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Saving>
 */
class SavingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Saving::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->word(),
            'target_amount' => $this->faker->randomFloat(2, 500, 10000),
            'current_amount' => $this->faker->randomFloat(2, 0, 5000),
            'description' => $this->faker->sentence(),
        ];
    }
}
