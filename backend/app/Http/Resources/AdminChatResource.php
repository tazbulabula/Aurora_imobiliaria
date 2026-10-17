<?php

namespace App\Http\Resources;

use App\Models\Interest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminChatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'interest_public_id' => $this->public_id,
            'status' => $this->status,
            'property' => [
                'public_id' => $this->property->public_id,
                'title' => $this->property->title,
            ],
            'interested' => [
                'public_id' => $this->interested->public_id,
                'name' => $this->interested->name,
            ],
            'owner' => [
                'public_id' => $this->property->owner->public_id,
                'name' => $this->property->owner->name,
            ],
            'messages_count' => $this->messages_count,
            'last_message' => $this->last_message_content
                ? [
                    'content' => mb_substr($this->last_message_content, 0, 120),
                    'created_at' => $this->last_message_at
                        ? \Carbon\Carbon::parse($this->last_message_at)->toIso8601String()
                        : null,
                ]
                : null,
        ];
    }

    public function chats(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $query = Interest::query()
            ->select('interests.*')
            ->selectSub(function ($q) {
                $q->selectRaw('created_at')
                    ->from('messages')
                    ->whereColumn('interest_id', 'interests.id')
                    ->latest()
                    ->limit(1);
            }, 'last_message_at')
            ->selectSub(function ($q) {
                $q->selectRaw('content')
                    ->from('messages')
                    ->whereColumn('interest_id', 'interests.id')
                    ->latest()
                    ->limit(1);
            }, 'last_message_content')
            ->whereHas('messages')
            ->with(['property.owner', 'interested'])
            ->withCount('messages')
            ->orderByDesc('last_message_at');

        return AdminChatResource::collection($query->paginate(20));
    }
}