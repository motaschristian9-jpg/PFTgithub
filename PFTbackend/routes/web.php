<?php

use Illuminate\Support\Facades\Route;

// Apply CSRF middleware to web routes
Route::middleware(['csrf'])->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });
});
