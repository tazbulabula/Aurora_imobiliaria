<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\ConfirmPaymentRequest;
use App\Http\Requests\Transaction\ConfirmTransferRequest;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Interest;
use App\Models\Transaction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminTransactionController extends Controller
{
    use AuthorizesRequests;
    public function store(StoreTransactionRequest $request, Interest $interest): JsonResponse
    {
        if ($interest->transaction) {
            return response()->json(['message' => 'Este interesse já tem uma transação.'], 422);
        }

        if (! in_array($interest->status, ['em_mediacao', 'visita_agendada', 'negociacao'], true)) {
            return response()->json(['message' => 'O interesse não está em fase de negociação.'], 422);
        }

        $amount = (int) $request->validated('amount');
        $percentage = (float) $request->validated('commission_percentage');
        $commission = (int) round($amount * $percentage / 100);
        $ownerAmount = $amount - $commission;

        $transaction = DB::transaction(function () use ($interest, $amount, $commission, $ownerAmount) {
            $transaction = Transaction::create([
                'interest_id' => $interest->id,
                'amount' => $amount,
                'commission_amount' => $commission,
                'owner_amount' => $ownerAmount,
                'payment_status' => 'pendente',
            ]);

            $interest->update(['status' => 'negociacao']);

            return $transaction;
        });

        return response()->json(new TransactionResource($transaction), 201);
    }

    public function confirmPayment(ConfirmPaymentRequest $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('confirmPayment', $transaction);

        $transaction->update([
            'payment_status' => 'pago',
            'payment_reference' => $request->validated('payment_reference'),
            'paid_at' => now(),
        ]);

        return response()->json(new TransactionResource($transaction));
    }

    public function confirmTransfer(ConfirmTransferRequest $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('confirmTransfer', $transaction);

        DB::transaction(function () use ($transaction, $request) {
            $transaction->update([
                'payment_status' => 'concluido',
                'transferred_at' => now(),
                
            ]);

            // Guarda a referência da transferência no payment_reference? Não — usa-se outro campo se quiseres.
            $transaction->interest->update([
                'status' => 'fechado',
                'transfer_reference' => $request->validated('transfer_reference')
                
                ]);
        });

        return response()->json(new TransactionResource($transaction));
    }
}