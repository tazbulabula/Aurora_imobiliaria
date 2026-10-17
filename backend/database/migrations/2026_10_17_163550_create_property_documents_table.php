<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['escritura', 'bi', 'comprovativo']);
            $table->string('url');
            $table->boolean('validated')->default(false);
            $table->timestamps();

            $table->index('property_id');
            $table->index('validated');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_documents');
    }
};