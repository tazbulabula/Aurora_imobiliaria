<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'public_id' => $this->public_id,
            'content' => $this->content,
            'sender' => new UserResource($this->whenLoaded('sender')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}