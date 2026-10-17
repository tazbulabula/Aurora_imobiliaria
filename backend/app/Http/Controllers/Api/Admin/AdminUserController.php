<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminUserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()->orderByDesc('created_at');

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->string('verification_status'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return UserResource::collection($query->paginate(20));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // Não permitir mudar o próprio role (evita autodemissão acidental)
        if ($user->id === $request->user()->id && $request->has('role')) {
            return response()->json(
                ['message' => 'Não podes alterar o teu próprio role.'],
                422
            );
        }

        $data = $request->validated();

        // Bloquear mudança de role de proprietário se tiver imóveis publicados
        if (
            isset($data['role'])
            && $data['role'] !== 'proprietario'
            && $user->role === 'proprietario'
            && $user->properties()->exists()
        ) {
            return response()->json(
                ['message' => 'Este utilizador tem imóveis publicados. Remove-os primeiro.'],
                422
            );
        }

        $user->update($data);

        return response()->json(new UserResource($user));
    }
}