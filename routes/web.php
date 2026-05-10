<?php

use Illuminate\Support\Facades\Route;

// Route to serve the Vue SPA
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');

// API Routes can be defined in routes/api.php
