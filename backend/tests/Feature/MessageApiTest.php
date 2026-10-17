<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;




class MessageApiTest extends TestCase
{
    
    public function test_interested_can_send_message(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $user = $interest->interested;
        Event::fake([MessageSent::class]);
        $response = $this->actingAs($user)->postJson(
            "/api/interests/{$interest->public_id}/messages",
            ['content' => 'Olá, gostaria de agendar uma visita.']
        );

        $response->assertCreated()
            ->assertJsonPath('content', 'Olá, gostaria de agendar uma visita.');
        
        $this->assertDatabaseHas('messages', [
            'interest_id' => $interest->id,
            'sender_id' => $user->id,
        ]);
    }

    public function test_owner_can_send_message(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $owner = $interest->property->owner;
        Event::fake([MessageSent::class]);

        $response = $this->actingAs($owner)->postJson(
            "/api/interests/{$interest->public_id}/messages",
            ['content' => 'Podemos agendar para sábado.']
        );

        $response->assertCreated();
    }

    public function test_admin_can_send_message(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $admin = User::factory()->admin()->create();
        Event::fake([MessageSent::class]);

        $response = $this->actingAs($admin)->postJson(
            "/api/interests/{$interest->public_id}/messages",
            ['content' => 'Vou mediar esta conversa.']
        );

        $response->assertCreated();
    }

    public function test_other_user_cannot_send_message(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $other = User::factory()->create();

        $response = $this->actingAs($other)->postJson(
            "/api/interests/{$interest->public_id}/messages",
            ['content' => 'Intrometido.']
        );

        $response->assertForbidden();
    }

    public function test_participants_can_list_messages_in_order(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $user = $interest->interested;

        Message::factory()->create([
            'interest_id' => $interest->id,
            'sender_id' => $user->id,
            'content' => 'Primeira',
            'created_at' => now()->subMinutes(10),
        ]);
        Message::factory()->create([
            'interest_id' => $interest->id,
            'sender_id' => $user->id,
            'content' => 'Segunda',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/interests/{$interest->public_id}/messages");

        $response->assertOk()
            ->assertJsonPath('data.0.content', 'Primeira')
            ->assertJsonPath('data.1.content', 'Segunda');
    }

    public function test_cannot_send_message_to_closed_interest(): void
    {
        $interest = Interest::factory()->fechado()->create();
        $user = $interest->interested;

        $response = $this->actingAs($user)->postJson(
            "/api/interests/{$interest->public_id}/messages",
            ['content' => 'Já fechou.']
        );

        $response->assertUnprocessable();
    }

    public function test_message_content_is_required(): void
    {
        $interest = Interest::factory()->emMediacao()->create();
        $user = $interest->interested;

        $response = $this->actingAs($user)->postJson(
            "/api/interests/{$interest->public_id}/messages",
            ['content' => '']
        );

        $response->assertUnprocessable();
    }
}