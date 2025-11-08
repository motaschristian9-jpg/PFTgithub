<?php

use Illuminate\Support\Facades\Route;
use L5Swagger\Http\Controllers\SwaggerController;
use L5Swagger\Http\Controllers\SwaggerAssetController;

// Web routes
Route::middleware(['csrf'])->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });
});

// Swagger routes
Route::group(['prefix' => 'api'], function () {
    // Use {documentation?} and provide a default value
    Route::get('documentation/{documentation?}', [SwaggerController::class, 'api'])
        ->name('l5-swagger.api')
        ->defaults('documentation', 'default');

    Route::get('docs/{jsonFile?}', [SwaggerController::class, 'docs'])
        ->where('jsonFile', '(.*)')
        ->name('l5-swagger.docs');

    Route::get('assets/{asset}', [SwaggerAssetController::class, 'index'])
        ->where('asset', '(.*)')
        ->name('l5-swagger.assets');
});
