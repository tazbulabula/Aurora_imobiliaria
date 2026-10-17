<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\PropertyApproved;
use App\Http\Controllers\Controller;
use App\Http\Requests\Property\RejectPropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Notifications\PropertyStatusChangedNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Event;

class AdminPropertyController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Property::with(['owner', 'media'])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('province', 'like', "%{$search}%")
                    ->orWhere('municipality', 'like', "%{$search}%")
                    ->orWhere('neighborhood', 'like', "%{$search}%");
            });
        }

        return PropertyResource::collection($query->paginate(20));
    }

    public function pending(): AnonymousResourceCollection
    {
        $properties = Property::where('status', 'pendente')
            ->with(['owner', 'media', 'documents'])
            ->orderBy('created_at')
            ->paginate(15);

        return PropertyResource::collection($properties);
    }

    public function approve(Property $property): JsonResponse
    {
        $this->authorize('approve', $property);

        $property->update(['status' => 'aprovado', 'rejection_reason' => null]);
        $property->load(['owner', 'media']);

        Event::dispatch(new PropertyApproved($property->load('owner')));
        $property->owner->notify(
            new PropertyStatusChangedNotification($property, 'aprovado')
        );

        return response()->json(new PropertyResource($property));
    }

    public function reject(RejectPropertyRequest $request, Property $property): JsonResponse
    {
        $this->authorize('reject', $property);

        $property->update([
            'status' => 'rejeitado',
            'rejection_reason' => $request->validated('rejection_reason'),
        ]);
        $property->load(['owner', 'media']);

        $property->owner->notify(
            new PropertyStatusChangedNotification(
                $property,
                'rejeitado',
                $property->rejection_reason
            )
        );

        return response()->json(new PropertyResource($property));
    }

    public function validateDocument(Property $property, int $documentId): JsonResponse
    {
        $this->authorize('update', $property);

        $document = $property->documents()->findOrFail($documentId);
        $document->update(['validated' => true]);

        return response()->json(['message' => 'Documento validado.']);
    }
}