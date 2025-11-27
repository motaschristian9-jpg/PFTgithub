<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\SavingController;

// Public test route without auth or throttle for CORS test
Route::get('/cors-test', function () {
    return response()->json(['success' => true, 'message' => 'CORS test endpoint']);
})->middleware(['cors']);

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])->middleware('auth:sanctum');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// Google OAuth routes
Route::get('/auth/google/login', [GoogleAuthController::class, 'loginWithGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Transaction routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('transactions', TransactionController::class);
    Route::get('transactions/search', [TransactionController::class, 'search']);
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::apiResource('budgets', BudgetController::class); 
    Route::apiResource('savings', SavingController::class)->only(['index', 'show']);
});
