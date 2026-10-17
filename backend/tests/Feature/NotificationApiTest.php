<?php

namespace Tests\Feature;

use App\Events\PropertyApproved;
use App\Models\Property;
use App\Models\User;
use App\Notifications\PropertyStatusChangedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_own_notifications(): void
    {
        $user = User::factory()->proprietario()->create();
        $property = Property::factory()->create(['owner_id' => $user->id]);

        $user->notify(new PropertyStatusChangedNotification($property, 'aprovado'));

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Imóvel aprovado')
            ->assertJsonPath('data.0.read', false);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->create();
        $user->notify(new PropertyStatusChangedNotification($property, 'aprovado'));

        $notification = $user->notifications()->first();

        $this->actingAs($user)
            ->postJson("/api/notifications/{$notification->id}/read")
            ->assertOk();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_as_read(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->create();

        $user->notify(new PropertyStatusChangedNotification($property, 'aprovado'));
        $user->notify(new PropertyStatusChangedNotification($property, 'rejeitado'));

        $this->actingAs($user)
            ->postJson('/api/notifications/read-all')
            ->assertOk();

        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_unread_count_endpoint(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->create();
        $user->notify(new PropertyStatusChangedNotification($property, 'aprovado'));

        $response = $this->actingAs($user)->getJson('/api/notifications/unread-count');

        $response->assertOk()->assertJsonPath('count', 1);
    }

    public function test_user_only_sees_own_notifications(): void
    {
        $other = User::factory()->create();
        $property = Property::factory()->create();
        $other->notify(new PropertyStatusChangedNotification($property, 'aprovado'));

        $me = User::factory()->create();

        $this->actingAs($me)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_approving_property_sends_notification(): void
    {
        $owner = User::factory()->proprietario()->create();
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $admin = User::factory()->admin()->create();

        Event::fake([PropertyApproved::class]);

        $this->actingAs($admin)
            ->postJson("/api/admin/properties/{$property->public_id}/approve")
            ->assertOk();

        $this->assertSame(1, $owner->fresh()->notifications()->count());
    }
}