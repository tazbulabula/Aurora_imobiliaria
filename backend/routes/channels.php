<?php

use App\Models\Interest;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Canal privado de cada utilizador (notificações)
Broadcast::channel('user.{userPublicId}', function (User $user, string $userPublicId) {
    return $user->public_id === $userPublicId;
});

// Canal privado de um interesse (chat mediado)
Broadcast::channel('interest.{interestPublicId}', function (User $user, string $interestPublicId) {
    $interest = Interest::where('public_id', $interestPublicId)->first();

    if (! $interest) {
        return false;
    }

    // Admin, interessado ou proprietário do imóvel
    return $user->isAdmin()
        || $interest->interested_id === $user->id
        || $interest->property->owner_id === $user->id;
});