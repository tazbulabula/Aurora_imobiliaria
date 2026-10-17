<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionApiTest extends TestCase
{

    public function test_admin_can_create_transaction_with_commission(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/interests/{$interest->public_id}/transactions",
            ['amount' => 10_000_000, 'commission_percentage' => 5]
        );

        $response->assertCreated()
            ->assertJsonPath('amount', 10_000_000)
            ->assertJsonPath('commission_amount', 500_000)
            ->assertJsonPath('owner_amount', 9_500_000)
            ->assertJsonPath('payment_status', 'pendente');
    }

    public function test_commission_cannot_exceed_10_percent(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/interests/{$interest->public_id}/transactions",
            ['amount' => 10_000_000, 'commission_percentage' => 15]
        );

        $response->assertUnprocessable();
    }

    public function test_non_admin_cannot_create_transaction(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $user = $interest->interested;

        $response = $this->actingAs($user)->postJson(
            "/api/admin/interests/{$interest->public_id}/transactions",
            ['amount' => 10_000_000, 'commission_percentage' => 5]
        );

        $response->assertForbidden();
    }

    public function test_admin_can_confirm_payment(): void
    {
        $transaction = Transaction::factory()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/transactions/{$transaction->public_id}/confirm-payment",
            ['payment_reference' => 'REF-1234-ABCD']
        );

        $response->assertOk()->assertJsonPath('payment_status', 'pago');
        $this->assertNotNull($transaction->fresh()->paid_at);
    }

    public function test_admin_can_confirm_transfer_and_interest_becomes_fechado(): void
    {
        $transaction = Transaction::factory()->pago()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/transactions/{$transaction->public_id}/confirm-transfer",
            ['transfer_reference' => 'TRF-9999']
        );

        $response->assertOk()->assertJsonPath('payment_status', 'concluido');
        $this->assertDatabaseHas('interests', [
            'id' => $transaction->interest_id,
            'status' => 'fechado',
        ]);
    }

    public function test_cannot_confirm_payment_twice(): void
    {
        $transaction = Transaction::factory()->pago()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/transactions/{$transaction->public_id}/confirm-payment",
            ['payment_reference' => 'REF-1234-ABCD']
        );

        $response->assertForbidden();
    }

    public function test_interested_user_can_view_own_transaction(): void
    {
        $transaction = Transaction::factory()->create();
        $user = $transaction->interest->interested;

        $response = $this->actingAs($user)
            ->getJson("/api/transactions/{$transaction->public_id}");

        $response->assertOk()->assertJsonPath('public_id', $transaction->public_id);
    }
}