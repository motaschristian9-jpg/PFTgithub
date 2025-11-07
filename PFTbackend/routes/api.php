<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\SavingController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [ForgotPasswordController::class, 'reset']);

// Social login (Google)
Route::get('/auth/google/login', [GoogleAuthController::class, 'loginWithGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Protected routes (Sanctum auth only)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Transactions routes
    Route::apiResource('transactions', TransactionController::class);

    // Budgets routes
    Route::apiResource('budgets', BudgetController::class);

    // Savings routes
    Route::apiResource('savings', SavingController::class);
});
