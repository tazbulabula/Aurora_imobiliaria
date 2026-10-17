<?php

namespace Database\Factories;

use App\Models\Interest;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InterestFactory extends Factory
{
    protected $model = Interest::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory()->aprovado(),
            'interested_id' => User::factory(),
            'status' => 'novo',
        ];
    }

    public function emMediacao(): static
    {
        return $this->state(fn () => ['status' => 'em_mediacao']);
    }

    public function fechado(): static
    {
        return $this->state(fn () => ['status' => 'fechado']);
    }

    public function cancelado(): static
    {
        return $this->state(fn () => ['status' => 'cancelado']);
    }
}