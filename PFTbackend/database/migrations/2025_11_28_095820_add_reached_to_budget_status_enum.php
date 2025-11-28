<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('active', 'completed', 'expired', 'reached') DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('active', 'completed', 'expired') DEFAULT 'active'");
    }
};
