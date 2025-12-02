<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\SavingController;
use App\Http\Controllers\ForgotPasswordController; // <-- ADD THIS CONTROLLER
use App\Jobs\TestRedisQueue;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public test route
Route::get('/cors-test', function () {
    return response()->json(['success' => true, 'message' => 'CORS test endpoint']);
})->middleware(['cors']);

Route::get('/test-queue', function () {
    TestRedisQueue::dispatch();
    return 'Job dispatched to Redis queue!';
});

// Auth routes (Public/Unprotected)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// Password Reset Routes (Public/Unprotected)
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [ForgotPasswordController::class, 'reset']);

// Google OAuth routes
Route::get('/auth/google/login', [GoogleAuthController::class, 'loginWithGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth-related protected routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);

    Route::post('/update-profile', [AuthController::class, 'updateProfile']);

    // Hybrid Auth & Notification Routes
    Route::put('/user/set-password', [AuthController::class, 'setLocalPassword']);
    Route::put('/user/acknowledge-notifications', [AuthController::class, 'acknowledgeNotifications']);

    // Data Routes
    Route::get('transactions/search', [TransactionController::class, 'search']);

    Route::apiResource('transactions', TransactionController::class);

    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

    Route::apiResource('budgets', BudgetController::class);

    Route::apiResource('savings', SavingController::class);
});