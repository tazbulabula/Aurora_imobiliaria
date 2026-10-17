<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function view(User $user, Transaction $transaction): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $interest = $transaction->interest;

        return $interest->interested_id === $user->id
            || $interest->property->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function confirmPayment(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin() && $transaction->payment_status === 'pendente';
    }

    public function confirmTransfer(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin() && $transaction->payment_status === 'pago';
    }
}