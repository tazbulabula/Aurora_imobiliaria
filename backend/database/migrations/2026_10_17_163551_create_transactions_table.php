<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('interest_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('amount'); // valor total pago pelo cliente
            $table->unsignedBigInteger('commission_amount'); // taxa (<=10%)
            $table->unsignedBigInteger('owner_amount'); // valor a transferir ao dono
            $table->string('payment_reference')->nullable(); // referência Multicaixa
            $table->enum('payment_status', [
                'pendente',
                'pago',
                'transferido',
                'concluido',
                'cancelado',
            ])->default('pendente');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamps();

            $table->index('payment_status');
            $table->index('payment_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};