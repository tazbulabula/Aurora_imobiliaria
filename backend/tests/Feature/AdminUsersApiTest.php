<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUsersApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users(): void
    {
        User::factory()->count(3)->create();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/users');

        $response->assertOk()->assertJsonCount(4, 'data');
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        User::factory()->proprietario()->count(2)->create();
        User::factory()->count(3)->create(); // interessados
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users?role=proprietario');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_admin_can_search_users(): void
    {
        User::factory()->create(['name' => 'João Silva', 'email' => 'joao@example.com']);
        User::factory()->create(['name' => 'Maria Santos']);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users?search=João');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_can_update_verification_status(): void
    {
        $user = User::factory()->create(['verification_status' => 'pendente']);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patchJson(
            "/api/admin/users/{$user->public_id}",
            ['verification_status' => 'verificado']
        );

        $response->assertOk();
        $this->assertSame('verificado', $user->fresh()->verification_status);
    }

    public function test_admin_can_change_user_role(): void
    {
        $user = User::factory()->create(['role' => 'interessado']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->patchJson(
            "/api/admin/users/{$user->public_id}",
            ['role' => 'proprietario']
        )->assertOk();

        $this->assertSame('proprietario', $user->fresh()->role);
    }

    public function test_cannot_demote_proprietario_with_properties(): void
    {
        $owner = User::factory()->proprietario()->create();
        Property::factory()->create(['owner_id' => $owner->id]);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patchJson(
            "/api/admin/users/{$owner->public_id}",
            ['role' => 'interessado']
        );

        $response->assertUnprocessable();
        $this->assertSame('proprietario', $owner->fresh()->role);
    }

    public function test_admin_cannot_change_own_role(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->patchJson(
            "/api/admin/users/{$admin->public_id}",
            ['role' => 'interessado']
        );

        $response->assertUnprocessable();
    }

    public function test_non_admin_cannot_list_or_update_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/users')->assertForbidden();
        $this->actingAs($user)
            ->patchJson("/api/admin/users/{$user->public_id}", ['role' => 'admin'])
            ->assertForbidden();
    }
}