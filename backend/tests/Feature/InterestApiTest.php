<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;



class InterestApiTest extends TestCase
{

    public function test_user_can_express_interest_in_approved_property(): void
    {
        $property = Property::factory()->aprovado()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/interests', [
            'property_public_id' => $property->public_id,
        ]);

        $response->assertCreated()->assertJsonPath('status', 'novo');
        $this->assertDatabaseHas('interests', [
            'property_id' => $property->id,
            'interested_id' => $user->id,
        ]);
    }

    public function test_cannot_express_interest_in_pending_property(): void
    {
        $property = Property::factory()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/interests', [
            'property_public_id' => $property->public_id,
        ]);

        $response->assertUnprocessable();
    }

    public function test_owner_cannot_express_interest_in_own_property(): void
    {
        $owner = User::factory()->proprietario()->create();
        $property = Property::factory()->aprovado()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)->postJson('/api/interests', [
            'property_public_id' => $property->public_id,
        ]);

        $response->assertUnprocessable();
    }

    public function test_duplicate_interest_returns_same_record(): void
    {
        $property = Property::factory()->aprovado()->create();
        $user = User::factory()->create();

        $first = $this->actingAs($user)->postJson('/api/interests', [
            'property_public_id' => $property->public_id,
        ]);
        $second = $this->actingAs($user)->postJson('/api/interests', [
            'property_public_id' => $property->public_id,
        ]);

        $this->assertSame(
            $first->json('data.public_id'),
            $second->json('data.public_id')
        );
        $this->assertDatabaseCount('interests', 1);
    }

    public function test_user_can_cancel_own_interest(): void
    {
        $interest = Interest::factory()->create();
        $user = $interest->interested;

        $response = $this->actingAs($user)
            ->postJson("/api/interests/{$interest->public_id}/cancel");

        $response->assertOk();
        $this->assertDatabaseHas('interests', ['id' => $interest->id, 'status' => 'cancelado']);
    }

    public function test_other_user_cannot_view_interest(): void
    {
        $interest = Interest::factory()->create();
        $other = User::factory()->create();

        $response = $this->actingAs($other)
            ->getJson("/api/interests/{$interest->public_id}");

        $response->assertForbidden();
    }

    public function test_admin_can_update_interest_status(): void
    {
        $interest = Interest::factory()->create();
        $admin = User::factory()->admin()->create();

        Event::fake();
        $response = $this->actingAs($admin)->patchJson(
            "/api/admin/interests/{$interest->public_id}/status",
            ['status' => 'em_mediacao']
        );

        $response->assertOk();
        $this->assertDatabaseHas('interests', ['id' => $interest->id, 'status' => 'em_mediacao']);
    }

    public function test_admin_cannot_set_interest_to_fechado_directly(): void
    {
        $interest = Interest::factory()->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patchJson(
            "/api/admin/interests/{$interest->public_id}/status",
            ['status' => 'fechado']
        );

        $response->assertUnprocessable();
    }
}