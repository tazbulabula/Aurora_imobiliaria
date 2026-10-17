<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\PropertyDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyDocumentFactory extends Factory
{
    protected $model = PropertyDocument::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'type' => fake()->randomElement(['escritura', 'bi', 'comprovativo']),
            'url' => 'https://example.com/docs/' . fake()->uuid() . '.pdf',
            'validated' => false,
        ];
    }

    public function validado(): static
    {
        return $this->state(fn () => ['validated' => true]);
    }
}