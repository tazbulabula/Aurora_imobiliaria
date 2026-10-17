<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Interest\StoreInterestRequest;
use App\Http\Resources\InterestResource;
use App\Models\Interest;
use App\Models\Property;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InterestController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request): AnonymousResourceCollection
    {
        $interests = Interest::where('interested_id', $request->user()->id)
            ->with(['property', 'property.owner', 'property.media', 'transaction'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return InterestResource::collection($interests);
    }

    public function store(StoreInterestRequest $request): JsonResponse
    {
        $property = Property::where('public_id', $request->validated('property_public_id'))
            ->firstOrFail();

        if ($property->status !== 'aprovado') {
            return response()->json(['message' => 'Imóvel não está disponível.'], 422);
        }

        if ($property->owner_id === $request->user()->id) {
            return response()->json(['message' => 'Não podes interessar-te pelo teu próprio imóvel.'], 422);
        }

        $interest = Interest::firstOrCreate(
            [
                'property_id' => $property->id,
                'interested_id' => $request->user()->id,
            ],
            ['status' => 'novo']
        );

        $interest->load(['property', 'interested']);

        return response()->json(new InterestResource($interest), 201);
    }

    public function show(Request $request, Interest $interest): JsonResponse
    {
        $this->authorize('view', $interest);

        $interest->load(['property', 'property.owner', 'property.media', 'interested', 'transaction']);

        return response()->json(new InterestResource($interest));
    }

    public function cancel(Interest $interest): JsonResponse
    {
        $this->authorize('cancel', $interest);

        $interest->update(['status' => 'cancelado']);

        return response()->json(new InterestResource($interest));
    }
}