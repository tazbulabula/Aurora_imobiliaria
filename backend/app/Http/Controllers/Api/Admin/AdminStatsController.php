<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interest;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'properties' => [
                'pendentes' => Property::where('status', 'pendente')->count(),
                'aprovados' => Property::where('status', 'aprovado')->count(),
                'rejeitados' => Property::where('status', 'rejeitado')->count(),
            ],
            'interests' => [
                'novos' => Interest::where('status', 'novo')->count(),
                'em_mediacao' => Interest::where('status', 'em_mediacao')->count(),
                'negociacao' => Interest::where('status', 'negociacao')->count(),
                'fechados' => Interest::where('status', 'fechado')->count(),
                'cancelados' => Interest::where('status', 'cancelado')->count(),
            ],
            'transactions' => [
                'pendentes' => Transaction::where('payment_status', 'pendente')->count(),
                'pagas' => Transaction::where('payment_status', 'pago')->count(),
                'concluidas' => Transaction::where('payment_status', 'concluido')->count(),
                'comissao_total' => (int) Transaction::where('payment_status', 'concluido')->sum('commission_amount'),
            ],
            'users' => [
                'total' => User::count(),
                'proprietarios' => User::where('role', 'proprietario')->count(),
                'interessados' => User::where('role', 'interessado')->count(),
            ],
        ]);
    }
}