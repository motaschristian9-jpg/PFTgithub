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
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['user_id', 'type']); // For filtering by type (income/expense)
            $table->index(['user_id', 'date']); // For filtering by date range and sorting
            $table->index(['user_id', 'category_id']); // For filtering by category
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type']);
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['user_id', 'category_id']);
        });
    }
};
