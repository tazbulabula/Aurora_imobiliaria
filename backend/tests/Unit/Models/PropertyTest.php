<?php

namespace Tests\Unit\Models;

use App\Models\Property;
use App\Models\User;
use Tests\TestCase;          
use Illuminate\Foundation\Testing\RefreshDatabase;

class PropertyTest extends TestCase
{
    public function test_property_belongs_to_owner(): void
    {
        $owner = User::factory()->proprietario()->create();
        $property = Property::factory()->create(['owner_id' => $owner->id]);

        $this->assertInstanceOf(User::class, $property->owner);
        $this->assertTrue($property->owner->is($owner));
    }

    public function test_property_has_media_ordered(): void
    {
        $property = Property::factory()->create();
        $property->media()->createMany([
            ['type' => 'foto', 'url' => 'a.jpg', 'order' => 2],
            ['type' => 'foto', 'url' => 'b.jpg', 'order' => 0],
            ['type' => 'foto', 'url' => 'c.jpg', 'order' => 1],
        ]);

        $orders = $property->media->pluck('order')->toArray();
        $this->assertSame([0, 1, 2], $orders);
    }

    public function test_aprovado_state_sets_status(): void
    {
        $property = Property::factory()->aprovado()->create();

        $this->assertTrue($property->isAprovado());
    }

    public function test_property_has_public_id(): void
    {
        $property = Property::factory()->create();

        $this->assertNotNull($property->public_id);
        $this->assertSame(36, strlen($property->public_id));
    }
}
