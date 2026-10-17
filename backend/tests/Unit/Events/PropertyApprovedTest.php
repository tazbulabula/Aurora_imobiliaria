<?php

namespace Tests\Unit\Events;

use App\Events\PropertyApproved;
use App\Models\Property;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyApprovedTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcasts_on_owner_private_channel(): void
    {
        $property = Property::factory()->aprovado()->create();
        $event = new PropertyApproved($property);

        $channels = $event->broadcastOn();

        $this->assertCount(1, $channels);
        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-user.' . $property->owner->public_id, $channels[0]->name);
    }

    public function test_broadcast_payload_contains_property_info(): void
    {
        $property = Property::factory()->aprovado()->create();
        $event = new PropertyApproved($property);

        $payload = $event->broadcastWith();

        $this->assertSame($property->public_id, $payload['property_public_id']);
        $this->assertSame($property->title, $payload['title']);
        $this->assertStringContainsString('aprovado', $payload['message']);
    }

    public function test_broadcast_as_name(): void
    {
        $property = Property::factory()->aprovado()->create();
        $event = new PropertyApproved($property);

        $this->assertSame('PropertyApproved', $event->broadcastAs());
    }
}