<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function view(?User $user, Property $property): bool
    {
        // Imóvel aprovado é visível para todos (incluindo visitantes)
        if ($property->status === 'aprovado') {
            return true;
        }

        // Para imóveis não aprovados, só o dono ou o admin
        if ($user === null) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $property->owner_id === $user->id;
    }

    public function update(User $user, Property $property): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $property->owner_id === $user->id;
    }

    public function delete(User $user, Property $property): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $property->owner_id === $user->id && $property->status !== 'aprovado';
    }

    public function approve(User $user, Property $property): bool
    {
        return $user->isAdmin() && $property->status === 'pendente';
    }

    public function reject(User $user, Property $property): bool
    {
        return $user->isAdmin() && $property->status === 'pendente';
    }
}