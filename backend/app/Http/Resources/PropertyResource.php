<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin();
        $isOwner = $request->user()?->id === $this->owner_id;

        return [
            'public_id' => $this->public_id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'price' => $this->price,
            'province' => $this->province,
            'municipality' => $this->municipality,
            'neighborhood' => $this->neighborhood,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'area_m2' => $this->area_m2,
            'status' => $this->status,
            'rejection_reason' => $this->when($isAdmin || $isOwner, $this->rejection_reason),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'media' => PropertyMediaResource::collection($this->whenLoaded('media')),
            'documents' => PropertyDocumentResource::collection(
                $this->when($isAdmin || $isOwner, $this->whenLoaded('documents'))
            ),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}