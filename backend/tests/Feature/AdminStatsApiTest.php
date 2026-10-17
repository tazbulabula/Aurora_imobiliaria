<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStatsApiTest extends TestCase
{
    

    public function test_admin_can_get_stats(): void
    {
        // 2 pendentes
        Property::factory()->count(2)->create(['status' => 'pendente']);

        // 3 aprovados, guardados para reutilizar
        $aprovados = Property::factory()->aprovado()->count(3)->create();

        // 2 interesses em mediação no primeiro imóvel aprovado
        $interesses = Interest::factory()->emMediacao()->count(2)->create([
            'property_id' => $aprovados->first()->id,
        ]);

        // 1 transação concluída no primeiro interesse
        Transaction::factory()->concluido()->create([
            'interest_id' => $interesses->first()->id,
            'commission_amount' => 500_000,
        ]);

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/stats');

        $response->assertOk()
            ->assertJsonPath('properties.pendentes', 2)
            ->assertJsonPath('properties.aprovados', 3)
            ->assertJsonPath('interests.em_mediacao', 2)
            ->assertJsonPath('transactions.concluidas', 1)
            ->assertJsonPath('transactions.comissao_total', 500000);
    }

    public function test_non_admin_cannot_get_stats(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/stats');

        $response->assertForbidden();
    }

    public function test_guest_cannot_get_stats(): void
    {
        $response = $this->getJson('/api/admin/stats');

        $response->assertUnauthorized();
    }
}