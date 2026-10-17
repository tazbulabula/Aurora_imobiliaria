<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function appypay(Request $request): JsonResponse
    {
        Log::info('AppyPay webhook received', $request->all());

        $chargeId = $request->input('id') ?? $request->input('charge_id');
        $status = $request->input('status');

        if (! $chargeId) {
            return response()->json(['message' => 'Missing charge id.'], 400);
        }

        $transaction = Transaction::where('appypay_charge_id', $chargeId)->first();

        if (! $transaction) {
            return response()->json(['message' => 'Transaction not found.'], 404);
        }

        if ($status === 'paid' || $status === 'success') {
            $transaction->update([
                'payment_status' => 'pago',
                'paid_at' => now(),
            ]);
        }

        return response()->json(['message' => 'ok']);
    }
}