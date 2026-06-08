<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
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

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);
// categories bisa diakses tanpa auth
Route::get('categories', [CategoryController::class, 'index']);


Route::middleware('throttle:5,1')->group(function () {
    Route::post('/admin/login', [AuthController::class, 'loginAdmin']);
    Route::post('/dealer/login', [AuthController::class, 'loginDealer']);

});

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/dealer/me', [AuthController::class, 'dealer']);
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

    // ─────────────────────────────────────────────
    // Product Management
    // ─────────────────────────────────────────────
    Route::middleware('can:product-management.access')->group(function () {

    });

    Route::middleware('can:product-management.create')->group(function () {
        Route::post('products', [ProductController::class, 'store']);
    });

    Route::middleware('can:product-management.edit')->group(function () {
        Route::put('products/{product}', [ProductController::class, 'update']);
    });

    Route::middleware('can:product-management.delete')->group(function () {
        Route::delete('products/{product}', [ProductController::class, 'destroy']);
    });

    // ─────────────────────────────────────────────
    // Category Management
    // ─────────────────────────────────────────────
    Route::middleware('can:product-management.access')->group(function () {
        Route::get('categories/{category}', [CategoryController::class, 'show']);
    });

    Route::middleware('can:product-management.create')->group(function () {
        Route::post('categories', [CategoryController::class, 'store']);
    });

    Route::middleware('can:product-management.edit')->group(function () {
        Route::put('categories/{category}', [CategoryController::class, 'update']);
    });

    Route::middleware('can:product-management.delete')->group(function () {
        Route::delete('categories/{category}', [CategoryController::class, 'destroy']);
    });
});

// Test API endpoint
Route::get('/test', function () {
    return response()->json([
        'message' => 'Hello from Laravel API!',
        'status' => 'success'
    ]);
});
