<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;



class AdminPropertyApiTest extends TestCase
{

    public function test_admin_can_list_pending_properties(): void
    {
        Property::factory()->count(2)->create(['status' => 'pendente']);
        Property::factory()->aprovado()->create();

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/properties/pending');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_admin_can_approve_property(): void
    {
        
        $property = Property::factory()->create();
        $admin = User::factory()->admin()->create();

        Event::fake();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/properties/{$property->public_id}/approve");

        $response->assertOk();
        $this->assertDatabaseHas('properties', ['id' => $property->id, 'status' => 'aprovado']);
    }

    public function test_admin_can_reject_property_with_reason(): void
    {
        $property = Property::factory()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/properties/{$property->public_id}/reject",
            ['rejection_reason' => 'Documentação incompleta.']
        );

        $response->assertOk();
        $this->assertDatabaseHas('properties', [
            'id' => $property->id,
            'status' => 'rejeitado',
            'rejection_reason' => 'Documentação incompleta.',
        ]);
    }

    public function test_non_admin_cannot_approve(): void
    {
        $property = Property::factory()->create();
        $user = User::factory()->proprietario()->create();

        $response = $this->actingAs($user)
            ->postJson("/api/admin/properties/{$property->public_id}/approve");

        $response->assertForbidden();
    }

    public function test_admin_can_validate_document(): void
    {
        $property = Property::factory()->create();
        $document = $property->documents()->create([
            'type' => 'escritura',
            'url' => 'https://example.com/esc.pdf',
            'validated' => false,
        ]);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->postJson(
            "/api/admin/properties/{$property->public_id}/documents/{$document->id}/validate"
        );

        $response->assertOk();
        $this->assertDatabaseHas('property_documents', ['id' => $document->id, 'validated' => true]);
    }

    public function test_admin_can_list_all_properties_with_filters(): void
    {
        Property::factory()->count(2)->create(['status' => 'pendente']);
        Property::factory()->count(3)->aprovado()->create();
        Property::factory()->rejeitado()->create();

        $admin = User::factory()->admin()->create();

        $all = $this->actingAs($admin)->getJson('/api/admin/properties');
        $all->assertOk()->assertJsonCount(6, 'data');

        $approved = $this->actingAs($admin)->getJson('/api/admin/properties?status=aprovado');
        $approved->assertOk()->assertJsonCount(3, 'data');

        $rejected = $this->actingAs($admin)->getJson('/api/admin/properties?status=rejeitado');
        $rejected->assertOk()->assertJsonCount(1, 'data');
    }
}