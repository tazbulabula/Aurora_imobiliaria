<?php

namespace App\Services;

use AppyPay\AppyPayClient;
use AppyPay\DTO\Requests\CreateGpoPaymentRequest;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        private AppyPayClient $client
    ) {}

    /**
     * Inicia um pagamento via Multicaixa Express (GPO).
     * Devolve a referência/id da transação na AppyPay.
     */
    public function initiateGpoPayment(Transaction $transaction, string $phoneNumber): array
    {
        $interest = $transaction->interest;
        $property = $interest->property;
        $interested = $interest->interested;

        $charge = $this->client->charges()->createGpoPayment(
            amount: (float) $transaction->amount,
            currency: 'AOA',
            merchantTransactionId: $transaction->public_id,
            paymentMethod: config('appypay.payment_methods.gpo_express'),
            phoneNumber: $phoneNumber,
            description: "Pagamento imóvel: {$property->title}",
            notify: [
                'name' => $interested->name,
                'telephone' => $phoneNumber,
                'email' => $interested->email,
            ]
        );

        Log::info('GPO payment initiated', [
            'transaction' => $transaction->public_id,
            'charge_id' => $charge->id ?? null,
        ]);

        return [
            'charge_id' => $charge->id ?? null,
            'status' => $charge->status ?? 'pending',
        ];
    }

    /**
     * Verifica o estado de um charge na AppyPay.
     */
    public function checkChargeStatus(string $chargeId): array
    {
        $charge = $this->client->charges()->get($chargeId);

        return [
            'id' => $charge->id,
            'status' => $charge->status,
        ];
    }
}