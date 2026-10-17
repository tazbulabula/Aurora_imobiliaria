<?php

namespace Tests\Unit\Models;

use App\Models\Interest;
use App\Models\Transaction;
use Tests\TestCase;          
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionTest extends TestCase
{
    public function test_transaction_belongs_to_interest(): void
    {
        $transaction = Transaction::factory()->create();

        $this->assertInstanceOf(Interest::class, $transaction->interest);
    }

    public function test_commission_plus_owner_amount_equals_total(): void
    {
        $transaction = Transaction::factory()->create();

        $this->assertSame(
            $transaction->amount,
            $transaction->commission_amount + $transaction->owner_amount
        );
    }

    public function test_pago_state_sets_paid_at(): void
    {
        $transaction = Transaction::factory()->pago()->create();

        $this->assertSame('pago', $transaction->payment_status);
        $this->assertNotNull($transaction->paid_at);
    }

    public function test_transaction_has_public_id(): void
    {
        $transaction = Transaction::factory()->create();

        $this->assertNotNull($transaction->public_id);
    }
}
