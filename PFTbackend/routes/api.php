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

// Public test route
Route::get('/cors-test', function () {
    return response()->json(['success' => true, 'message' => 'CORS test endpoint']);
})->middleware(['cors']);

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// Google OAuth routes
Route::get('/auth/google/login', [GoogleAuthController::class, 'loginWithGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth-related protected routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);

    // NEW: Update Profile Route (Changed from update-avatar)
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);

    // 1. Specific routes FIRST
    Route::get('transactions/search', [TransactionController::class, 'search']);

    // 2. Resource routes
    Route::apiResource('transactions', TransactionController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

    // Budgets
    Route::apiResource('budgets', BudgetController::class);

    // Savings
    Route::apiResource('savings', SavingController::class);
});