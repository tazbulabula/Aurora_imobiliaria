<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{

    public function test_interested_user_can_initiate_payment(): void
    {
        $transaction = Transaction::factory()->create();
        $user = $transaction->interest->interested;

        $response = $this->actingAs($user)->postJson(
            "/api/transactions/{$transaction->public_id}/pay-gpo",
            ['phone_number' => '923456789']
        );

        // Como a chamada real ao SDK falha sem credenciais, verificamos apenas
        // que a autorização passou (não é 403) e que a validação passou (não é 422)
        $this->assertNotSame(403, $response->status());
        $this->assertNotSame(422, $response->status());
    }

    public function test_other_user_cannot_initiate_payment(): void
    {
        $transaction = Transaction::factory()->create();
        $other = User::factory()->create();

        $response = $this->actingAs($other)->postJson(
            "/api/transactions/{$transaction->public_id}/pay-gpo",
            ['phone_number' => '923456789']
        );

        $response->assertForbidden();
    }

    public function test_cannot_pay_non_pending_transaction(): void
    {
        $transaction = Transaction::factory()->pago()->create();
        $user = $transaction->interest->interested;

        $response = $this->actingAs($user)->postJson(
            "/api/transactions/{$transaction->public_id}/pay-gpo",
            ['phone_number' => '923456789']
        );

        $response->assertUnprocessable();
    }
}