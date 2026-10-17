<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '9' . fake()->unique()->numerify('#########'),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'interessado',
            'verification_status' => 'pendente',
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'role' => 'admin',
            'verification_status' => 'verificado',
        ]);
    }

    public function proprietario(): static
    {
        return $this->state(fn () => [
            'role' => 'proprietario',
            'verification_status' => 'verificado',
        ]);
    }

    public function verificado(): static
    {
        return $this->state(fn () => [
            'verification_status' => 'verificado',
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
            'verification_status' => 'pendente',
        ]);
    }
}