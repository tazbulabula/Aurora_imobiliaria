<?php

namespace Database\Factories;

use App\Models\Interest;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $amount = fake()->numberBetween(500_000, 50_000_000);
        $commission = (int) round($amount * 0.05); // 5% por defeito

        return [
            'interest_id' => Interest::factory(),
            'amount' => $amount,
            'commission_amount' => $commission,
            'owner_amount' => $amount - $commission,
            'payment_reference' => strtoupper(fake()->bothify('REF-####-????')),
            'payment_status' => 'pendente',
            'paid_at' => null,
            'transferred_at' => null,
        ];
    }

    public function pago(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'pago',
            'paid_at' => now(),
        ]);
    }

    public function transferido(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'transferido',
            'paid_at' => now()->subDay(),
            'transferred_at' => now(),
        ]);
    }

    public function concluido(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'concluido',
            'paid_at' => now()->subDays(2),
            'transferred_at' => now()->subDay(),
        ]);
    }
}