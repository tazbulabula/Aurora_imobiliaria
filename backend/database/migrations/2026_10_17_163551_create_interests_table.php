<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interests', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('interested_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', [
                'novo',
                'em_mediacao',
                'visita_agendada',
                'negociacao',
                'fechado',
                'cancelado',
            ])->default('novo');
            $table->timestamps();

            $table->unique(['property_id', 'interested_id']);


            $table->index('interested_id');
            $table->index('status');
            $table->index(['property_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interests');
    }
};