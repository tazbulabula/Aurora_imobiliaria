<?php

namespace Tests\Unit\Events;

use App\Events\InterestStatusChanged;
use App\Models\Interest;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InterestStatusChangedTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcasts_on_interested_and_owner_channels(): void
    {
        $interest = Interest::factory()->create();
        $event = new InterestStatusChanged($interest, 'em_mediacao');

        $channels = $event->broadcastOn();

        $this->assertCount(2, $channels);

        $names = array_map(fn ($c) => $c->name, $channels);
        $this->assertContains('private-user.' . $interest->interested->public_id, $names);
        $this->assertContains('private-user.' . $interest->property->owner->public_id, $names);
    }

    public function test_broadcast_payload_contains_status(): void
    {
        $interest = Interest::factory()->create();
        $event = new InterestStatusChanged($interest, 'negociacao');

        $payload = $event->broadcastWith();

        $this->assertSame($interest->public_id, $payload['interest_public_id']);
        $this->assertSame('negociacao', $payload['status']);
    }

    public function test_broadcast_as_name(): void
    {
        $interest = Interest::factory()->create();
        $event = new InterestStatusChanged($interest, 'novo');

        $this->assertSame('InterestStatusChanged', $event->broadcastAs());
    }
}