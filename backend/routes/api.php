<?php

use App\Http\Controllers\Api\Admin\AdminInterestController;
use App\Http\Controllers\Api\Admin\AdminPropertyController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\AdminTransactionController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InterestController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Listagem pública (sem login)
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

Route::post('/webhooks/appypay', [WebhookController::class, 'appypay']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/my/properties', [PropertyController::class, 'mine']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::patch('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/properties/pending', [AdminPropertyController::class, 'pending']);
        Route::post('/properties/{property}/approve', [AdminPropertyController::class, 'approve']);
        Route::post('/properties/{property}/reject', [AdminPropertyController::class, 'reject']);
        Route::post('/properties/{property}/documents/{documentId}/validate', [AdminPropertyController::class, 'validateDocument']);
    });

    // Interesses (utilizador)
    Route::get('/my/interests', [InterestController::class, 'index']);
    Route::post('/interests', [InterestController::class, 'store']);
    Route::get('/interests/{interest}', [InterestController::class, 'show']);
    Route::post('/interests/{interest}/cancel', [InterestController::class, 'cancel']);

    // Transação (utilizador vê a sua)
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);

    // Admin — interesses e transações
    Route::prefix('admin')->middleware('admin')->group(function () {

        Route::get('/interests', [AdminInterestController::class, 'index']);
        Route::patch('/interests/{interest}/status', [AdminInterestController::class, 'updateStatus']);

        Route::post('/interests/{interest}/transactions', [AdminTransactionController::class, 'store']);
        Route::post('/transactions/{transaction}/confirm-payment', [AdminTransactionController::class, 'confirmPayment']);
        Route::post('/transactions/{transaction}/confirm-transfer', [AdminTransactionController::class, 'confirmTransfer']);

        Route::get('/stats', [AdminStatsController::class, 'index']);

        Route::get('/properties', [AdminPropertyController::class, 'index']);
        Route::get('/chats', [AdminInterestController::class, 'chats']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);
    });

    Route::get('/interests/{interest}/messages', [MessageController::class, 'index']);
    Route::post('/interests/{interest}/messages', [MessageController::class, 'store']);


    Route::post('/uploads', [UploadController::class, 'store']);

    Route::post('/transactions/{transaction}/pay-gpo', [PaymentController::class, 'initiateGpo']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);


});