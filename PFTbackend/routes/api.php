<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\SavingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

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

// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {

    // 1. Specific routes FIRST (to avoid conflicts with wildcards)
    Route::get('transactions/search', [TransactionController::class, 'search']);

    // 2. Resource routes
    Route::apiResource('transactions', TransactionController::class);

    // Categories are usually read-only for users
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

    // Budgets - Full CRUD
    Route::apiResource('budgets', BudgetController::class);

    // Savings - Full CRUD (Removed ->only restriction so store/update/delete works)
    Route::apiResource('savings', SavingController::class);
});