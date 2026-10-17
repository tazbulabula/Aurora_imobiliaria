<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminChatsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_chats_with_messages(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $interest->messages()->create([
            'sender_id' => $interest->interested_id,
            'content' => 'Olá',
        ]);

        // Interesse sem mensagens (não deve aparecer)
        Interest::factory()->emMediacao()->create();

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/chats');

        $response->assertOk()->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.messages_count', 1);
        $response->assertJsonPath('data.0.last_message.content', 'Olá');
    }

    public function test_non_admin_cannot_list_chats(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/admin/chats')->assertForbidden();
    }
}