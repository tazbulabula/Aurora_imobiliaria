<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function initiateGpo(Request $request, Transaction $transaction): JsonResponse
    {
        // Só o interessado pode iniciar o pagamento da sua própria transação
        if ($transaction->interest->interested_id !== $request->user()->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        if ($transaction->payment_status !== 'pendente') {
            return response()->json(['message' => 'Esta transação já não está pendente.'], 422);
        }

        $request->validate([
            'phone_number' => ['required', 'string', 'regex:/^9\d{8}$/'],
        ]);

        $result = $this->paymentService->initiateGpoPayment(
            $transaction,
            $request->validated('phone_number')
        );

        $transaction->update([
            'appypay_charge_id' => $result['charge_id'],
        ]);

        return response()->json([
            'message' => 'Pedido de pagamento enviado para o Multicaixa Express.',
            'charge_id' => $result['charge_id'],
            'status' => $result['status'],
        ]);
    }
}