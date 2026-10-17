<?php

namespace App\Events;

use App\Models\Interest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InterestStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Interest $interest,
        public string $newStatus
    ) {}

    public function broadcastOn(): array
    {
        // Notifica o interessado e o proprietário
        return [
            new PrivateChannel('user.' . $this->interest->interested->public_id),
            new PrivateChannel('user.' . $this->interest->property->owner->public_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'InterestStatusChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'interest_public_id' => $this->interest->public_id,
            'property_title' => $this->interest->property->title,
            'status' => $this->newStatus,
            'message' => "O estado do processo para \"{$this->interest->property->title}\" mudou para: {$this->newStatus}.",
        ];
    }
}