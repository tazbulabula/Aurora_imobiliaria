<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory()->proprietario(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement(['venda', 'arrendamento']),
            'price' => fake()->numberBetween(500_000, 50_000_000),
            'province' => fake()->randomElement([
                'Luanda', 'Benguela', 'Huíla', 'Huambo', 'Cabinda',
            ]),
            'municipality' => fake()->city(),
            'neighborhood' => fake()->streetName(),
            'bedrooms' => fake()->numberBetween(1, 5),
            'bathrooms' => fake()->numberBetween(1, 4),
            'area_m2' => fake()->numberBetween(40, 500),
            'status' => 'pendente',
            'rejection_reason' => null,
        ];
    }

    public function aprovado(): static
    {
        return $this->state(fn () => ['status' => 'aprovado']);
    }

    public function rejeitado(): static
    {
        return $this->state(fn () => [
            'status' => 'rejeitado',
            'rejection_reason' => 'Documentação incompleta.',
        ]);
    }

    public function venda(): static
    {
        return $this->state(fn () => ['type' => 'venda']);
    }

    public function arrendamento(): static
    {
        return $this->state(fn () => ['type' => 'arrendamento']);
    }
}