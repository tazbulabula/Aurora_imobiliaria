<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Property::query()
            ->where('status', 'aprovado')
            ->with(['owner', 'media']);

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }
        if ($request->filled('province')) {
            $query->where('province', $request->string('province'));
        }
        if ($request->filled('municipality')) {
            $query->where('municipality', $request->string('municipality'));
        }
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->integer('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->integer('max_price'));
        }
        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', $request->integer('bedrooms'));
        }

        $query->orderByDesc('created_at');

        return PropertyResource::collection($query->paginate(15));
    }

    public function show(Request $request, Property $property): JsonResponse
    {
        $this->authorize('view', $property);

        $property->load(['owner', 'media', 'documents']);

        return response()->json(new PropertyResource($property));
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $property = DB::transaction(function () use ($data, $request) {
            $property = Property::create([
                ...collect($data)->except(['media', 'documents'])->toArray(),
                'owner_id' => $request->user()->id,
                'status' => 'pendente',
            ]);

            foreach ($data['media'] as $index => $item) {
                $property->media()->create([
                    'type' => $item['type'],
                    'url' => $item['url'],
                    'order' => $item['order'] ?? $index,
                ]);
            }

            foreach ($data['documents'] as $item) {
                $property->documents()->create([
                    'type' => $item['type'],
                    'url' => $item['url'],
                    'validated' => false,
                ]);
            }

            return $property;
        });

        $property->load(['owner', 'media', 'documents']);

        return response()->json(new PropertyResource($property), 201);
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $property->update($request->validated());

        // Se já estava aprovado, volta a pendente após edição
        if ($property->status === 'aprovado') {
            $property->update(['status' => 'pendente']);
        }

        $property->load(['owner', 'media', 'documents']);

        return response()->json(new PropertyResource($property));
    }

    public function destroy(Property $property): JsonResponse
    {
        $this->authorize('delete', $property);

        $property->delete();

        return response()->json(['message' => 'Imóvel removido.']);
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        $properties = Property::where('owner_id', $request->user()->id)
            ->with(['owner', 'media'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return PropertyResource::collection($properties);
    }
}