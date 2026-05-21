<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\User\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User Management
    Route::middleware('can:user-management.access')->group(function () {
        Route::apiResource('users', UserController::class)->except(['index']); // index sudah di-cover 'access'
        Route::get('users', [UserController::class, 'index']);
    });

    Route::middleware('can:user-management.create')->group(function () {
        Route::post('users', [UserController::class, 'store']);
    });

    Route::middleware('can:user-management.edit')->group(function () {
        Route::put('users/{user}', [UserController::class, 'update']);
    });

    // Role Management
    Route::middleware('can:role-management.access')->group(function () {
        Route::get('/roles', [UserController::class, 'roles']);
    });

    Route::middleware('can:role-management.create')->group(function () {
        Route::post('/roles', [UserController::class, 'storeRole']);
    });

    Route::middleware('can:role-management.edit')->group(function () {
        Route::put('/roles/{id}', [UserController::class, 'updateRole']);
    });

    Route::middleware('can:role-management.delete')->group(function () {
        Route::delete('/roles/{id}', [UserController::class, 'destroyRole']);
    });

    // Permission Management
    Route::middleware('can:role-management.access')->group(function () {
        Route::get('/permissions', [UserController::class, 'permissions']);
    });

    Route::get('/login-activity-logs', function () {
        return [];
    });
});

// Test API endpoint
Route::get('/test', function () {
    return response()->json([
        'message' => 'Hello from Laravel API!',
        'status' => 'success'
    ]);
});
