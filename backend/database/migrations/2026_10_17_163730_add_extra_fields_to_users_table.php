<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('public_id')->unique();
            $table->string('phone')->unique()->after('email');
            $table->enum('role', ['proprietario', 'interessado', 'admin'])
                  ->default('interessado')
                  ->after('phone');
            $table->enum('verification_status', ['pendente', 'verificado', 'rejeitado'])
                  ->default('pendente')
                  ->after('role');
            $table->index('role');
            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'verification_status']);
        });

        Schema::enableForeignKeyConstraints();
    }
};