<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Adds a nullable column that links to your savings table
            // Note: Check your database to confirm if the table is named 'savings' or 'savings_goals'
            // I am assuming 'savings' based on your previous hooks. 
            // If your table is 'savings_goals', change 'savings' to 'savings_goals' below.
            $table->foreignId('saving_goal_id')->nullable()->constrained('savings')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['saving_goal_id']);
            $table->dropColumn('saving_goal_id');
        });
    }
};
