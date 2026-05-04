<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;

// Auth (public)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// Public POS data — no auth required so the storefront works for anyone
Route::get('/categories',         [CategoryController::class, 'index']);
Route::get('/menu-items',         [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuItemController::class, 'show']);
Route::get('/orders/recent',      [OrderController::class, 'recent']);
Route::post('/orders',            [OrderController::class, 'store']);

// Admin-only (require token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    Route::get('/dashboard',     [DashboardController::class, 'index']);
    Route::get('/orders',        [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
});
