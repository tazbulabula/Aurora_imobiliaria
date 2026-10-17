<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['venda', 'arrendamento']);
            $table->unsignedBigInteger('price'); // em kwanzas, inteiro
            $table->string('province');
            $table->string('municipality');
            $table->string('neighborhood');
            $table->unsignedSmallInteger('bedrooms')->default(0);
            $table->unsignedSmallInteger('bathrooms')->default(0);
            $table->unsignedInteger('area_m2')->nullable();
            $table->enum('status', ['pendente', 'aprovado', 'rejeitado'])
                  ->default('pendente');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['status', 'type']);
            $table->index(['province', 'municipality']);
            $table->index('status');
            $table->index(['status', 'province', 'municipality']);
            $table->index('owner_id');
            $table->index('price');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('properties');
        Schema::enableForeignKeyConstraints();
    }
};