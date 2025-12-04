<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('amount', 10, 2);
            $table->unsignedBigInteger('category_id')->nullable(); // For categorization
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'completed', 'expired', 'reached'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
