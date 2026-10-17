<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Interest;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Event;

class MessageController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Interest $interest): AnonymousResourceCollection
    {
        $this->authorize('view', $interest);

        $messages = $interest->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->paginate(50);

        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request, Interest $interest): JsonResponse
    {
        $this->authorize('view', $interest);

        if (in_array($interest->status, ['fechado', 'cancelado'], true)) {
            return response()->json(['message' => 'Este processo já terminou.'], 422);
        }

        $message = $interest->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => $request->validated('content'),
        ]);

        $message->load('sender');
        
        Event::dispatch(new MessageSent($message));
        // broadcast(new MessageSent($message));

        $interest->load(['property.owner', 'interested']);

        $sender = $request->user();
        $recipients = collect();

        // Se o admin enviou, notifica interessado e proprietário
        if ($sender->isAdmin()) {
            $recipients->push($interest->interested, $interest->property->owner);
        }
        // Se um dos utilizadores enviou, notifica todos os admins
        else {
            $recipients = User::where('role', 'admin')->get();
        }

        $recipients
            ->filter(fn ($u) => $u->id !== $sender->id)
            ->unique('id')
            ->each(fn ($u) => $u->notify(new NewMessageNotification($message)));

        return response()->json(new MessageResource($message), 201);
    }
}