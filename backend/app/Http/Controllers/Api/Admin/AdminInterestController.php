<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\InterestStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Interest\UpdateInterestStatusRequest;
use App\Http\Resources\AdminChatResource;
use App\Http\Resources\InterestResource;
use App\Models\Interest;
use App\Notifications\InterestStatusChangedNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminInterestController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Interest::with(['property', 'property.owner', 'interested', 'transaction'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return InterestResource::collection($query->paginate(15));
    }

    public function updateStatus(UpdateInterestStatusRequest $request, Interest $interest): JsonResponse
    {
        $this->authorize('updateStatus', $interest);

        $interest->update(['status' => $request->validated('status')]);
        $interest->load(['property.owner', 'interested', 'transaction']);

        broadcast(new InterestStatusChanged($interest, $interest->status));

        // Notifica o interessado e o proprietário
        $interest->interested->notify(
            new InterestStatusChangedNotification($interest, $interest->status)
        );
        $interest->property->owner->notify(
            new InterestStatusChangedNotification($interest, $interest->status)
        );

        return response()->json(new InterestResource($interest));
    }

    public function chats(): AnonymousResourceCollection
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