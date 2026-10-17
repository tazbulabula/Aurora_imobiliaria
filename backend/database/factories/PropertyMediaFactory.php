<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyMediaFactory extends Factory
{
    protected $model = PropertyMedia::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'type' => 'foto',
            'url' => 'https://picsum.photos/seed/' . fake()->uuid() . '/800/600',
            'order' => fake()->numberBetween(0, 10),
        ];
    }

    public function video(): static
    {
        return $this->state(fn () => [
            'type' => 'video',
            'url' => 'https://example.com/video/' . fake()->uuid() . '.mp4',
        ]);
    }
}