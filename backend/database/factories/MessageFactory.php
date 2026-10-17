<?php

namespace Database\Factories;

use App\Models\Interest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'interest_id' => Interest::factory(),
            'sender_id' => User::factory(),
            'content' => fake()->sentence(12),
        ];
    }
}