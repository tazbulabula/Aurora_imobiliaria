<?php

namespace App\Events;

use App\Models\Property;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PropertyApproved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Property $property
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->property->owner->public_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PropertyApproved';
    }

    public function broadcastWith(): array
    {
        return [
            'property_public_id' => $this->property->public_id,
            'title' => $this->property->title,
            'message' => "O teu imóvel \"{$this->property->title}\" foi aprovado.",
        ];
    }
}