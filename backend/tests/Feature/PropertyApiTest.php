<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyApiTest extends TestCase
{

    public function test_public_can_list_approved_properties(): void
    {
        Property::factory()->aprovado()->count(3)->create();
        Property::factory()->create(['status' => 'pendente']);
        Property::factory()->rejeitado()->create();

        $response = $this->getJson('/api/properties');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_public_can_filter_by_type_and_province(): void
    {
        Property::factory()->aprovado()->venda()->create(['province' => 'Luanda']);
        Property::factory()->aprovado()->arrendamento()->create(['province' => 'Luanda']);

        $response = $this->getJson('/api/properties?type=venda&province=Luanda');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_public_can_view_approved_property_by_public_id(): void
    {
        $property = Property::factory()->aprovado()->create();

        $response = $this->getJson("/api/properties/{$property->public_id}");

        $response->assertOk()->assertJsonPath('public_id', $property->public_id);
    }

    public function test_public_cannot_view_pending_property(): void
    {
        $property = Property::factory()->create();

        $response = $this->getJson("/api/properties/{$property->public_id}");

        $response->assertForbidden();
    }

    public function test_proprietario_can_create_property(): void
    {
        $user = User::factory()->proprietario()->create();

        $response = $this->actingAs($user)->postJson('/api/properties', [
            'title' => 'Casa T3 no Kilamba',
            'description' => 'Casa espaçosa com quintal.',
            'type' => 'venda',
            'price' => 25_000_000,
            'province' => 'Luanda',
            'municipality' => 'Belas',
            'neighborhood' => 'Kilamba',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'area_m2' => 150,
            'media' => [
                ['type' => 'foto', 'url' => 'https://example.com/1.jpg', 'order' => 0],
            ],
            'documents' => [
                ['type' => 'escritura', 'url' => 'https://example.com/esc.pdf'],
            ],
        ]);

        $response->assertCreated()->assertJsonPath('status', 'pendente');
        $this->assertDatabaseCount('properties', 1);
    }

    public function test_interessado_cannot_create_property(): void
    {
        $user = User::factory()->create(); // role interessado

        $response = $this->actingAs($user)->postJson('/api/properties', [
            'title' => 'Tentativa',
            'description' => 'x',
            'type' => 'venda',
            'price' => 1,
            'province' => 'Luanda',
            'municipality' => 'x',
            'neighborhood' => 'x',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'media' => [['type' => 'foto', 'url' => 'https://example.com/1.jpg']],
            'documents' => [['type' => 'bi', 'url' => 'https://example.com/1.pdf']],
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_update_own_property_and_status_resets(): void
    {
        $owner = User::factory()->proprietario()->create();
        $property = Property::factory()->aprovado()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)->patchJson(
            "/api/properties/{$property->public_id}",
            ['price' => 30_000_000]
        );

        $response->assertOk()->assertJsonPath('status', 'pendente');
        $this->assertDatabaseHas('properties', ['id' => $property->id, 'price' => 30_000_000]);
    }

    public function test_other_user_cannot_update_property(): void
    {
        $property = Property::factory()->create();
        $other = User::factory()->proprietario()->create();

        $response = $this->actingAs($other)->patchJson(
            "/api/properties/{$property->public_id}",
            ['price' => 1]
        );

        $response->assertForbidden();
    }

    public function test_owner_can_delete_non_approved_property(): void
    {
        $owner = User::factory()->proprietario()->create();
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)
            ->deleteJson("/api/properties/{$property->public_id}");

        $response->assertOk();
        $this->assertDatabaseMissing('properties', ['id' => $property->id]);
    }

    public function test_owner_cannot_delete_approved_property(): void
    {
        $owner = User::factory()->proprietario()->create();
        $property = Property::factory()->aprovado()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)
            ->deleteJson("/api/properties/{$property->public_id}");

        $response->assertForbidden();
    }
}