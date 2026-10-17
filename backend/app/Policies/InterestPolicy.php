<?php

namespace App\Policies;

use App\Models\Interest;
use App\Models\User;

class InterestPolicy
{
    public function view(User $user, Interest $interest): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $interest->interested_id === $user->id
            || $interest->property->owner_id === $user->id;
    }

    public function updateStatus(User $user, Interest $interest): bool
    {
        return $user->isAdmin();
    }

    public function cancel(User $user, Interest $interest): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $interest->interested_id === $user->id
            && in_array($interest->status, ['novo', 'em_mediacao'], true);
    }
}