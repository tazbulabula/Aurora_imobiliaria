<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\StoreUploadRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(StoreUploadRequest $request): JsonResponse
    {
        $category = $request->validated('category');
        $file = $request->file('file');

        // Pasta por categoria e por utilizador (isolamento)
        $folder = "uploads/{$category}/" . $request->user()->public_id;

        $path = $file->store($folder, 'public');

        return response()->json([
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
            'type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ], 201);
    }
}