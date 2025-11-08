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
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->middleware('throttle:5,1');
Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])->name('password.reset');

// Social login (Google)
Route::get('/auth/google/login', [GoogleAuthController::class, 'loginWithGoogle']);

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);




// Protected routes (Sanctum auth only)
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Transactions routes
    Route::apiResource('transactions', TransactionController::class);
    Route::get('transactions/summary/monthly', [TransactionController::class, 'monthlySummary']);

    // Budgets routes
    Route::apiResource('budgets', BudgetController::class);

    // Savings routes
    Route::apiResource('savings', SavingController::class);
});

// Test route for ApiException (public for testing)
Route::get('/test-exception', [AuthController::class, 'testException']);
