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
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User Management
    Route::apiResource('users', UserController::class);

    // Role Management
    Route::get('/roles', [UserController::class, 'roles']);
    Route::post('/roles', [UserController::class, 'storeRole']);
    Route::put('/roles/{id}', [UserController::class, 'updateRole']);
    Route::delete('/roles/{id}', [UserController::class, 'destroyRole']);

    // Permission Management
    Route::get('/permissions', [UserController::class, 'permissions']);

    // Stub for login activity logs
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
