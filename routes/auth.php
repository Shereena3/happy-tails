<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\PetClinicSessionController;
use App\Http\Controllers\Auth\PetOwnerSessionController;
use App\Http\Controllers\Auth\RegisteredPetClinicController;
use App\Http\Controllers\Auth\RegisteredPetOwnerController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

// ─────────────────────────────────────────────────────────────────────────────
// TSF STUDENT PORTAL  (guard: web  |  table: users)
// Pages: auth/login   auth/register
// ─────────────────────────────────────────────────────────────────────────────

Route::middleware('guest')->group(function () {
    Route::get('register',  [RegisteredUserController::class,       'create'])->name('register');
    Route::post('register', [RegisteredUserController::class,       'store']);

    Route::get('login',     [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login',    [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password',        [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password',       [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class,       'create'])->name('password.reset');
    Route::post('reset-password',        [NewPasswordController::class,       'store'])->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-otp',  [OtpVerificationController::class, 'show'])->name('otp.verify');
    Route::post('verify-otp', [OtpVerificationController::class, 'verify']);
    Route::post('resend-otp', [OtpVerificationController::class, 'resend'])->name('otp.resend');

    Route::get('verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')->name('verification.send');

    Route::get('confirm-password',  [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
    Route::put('password',          [PasswordController::class, 'update'])->name('password.update');
    Route::post('logout',           [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// ─────────────────────────────────────────────────────────────────────────────
// HAPPY TAILS — PET OWNER  (guard: pet_owner  |  table: pet_owners)
// Pages: auth/owner-login   auth/owner-register
// ─────────────────────────────────────────────────────────────────────────────

Route::prefix('owner')->name('owner.')->group(function () {

    Route::middleware('guest:pet_owner')->group(function () {
        Route::get('/login',     [PetOwnerSessionController::class,    'create'])->name('login');
        Route::post('/login',    [PetOwnerSessionController::class,    'store']);
        Route::get('/register',  [RegisteredPetOwnerController::class, 'create'])->name('register');
        Route::post('/register', [RegisteredPetOwnerController::class, 'store']);
    });

    Route::middleware('auth:pet_owner')->group(function () {
        Route::post('/logout', [PetOwnerSessionController::class, 'destroy'])->name('logout');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// HAPPY TAILS — PET CLINIC  (guard: pet_clinic  |  table: pet_clinics)
// Pages: auth/owner-login (clinic tab)   auth/clinic-register
// ─────────────────────────────────────────────────────────────────────────────

Route::prefix('clinic')->name('clinic.')->group(function () {

    Route::middleware('guest:pet_clinic')->group(function () {
        Route::get('/login',     [PetClinicSessionController::class,    'create'])->name('login');
        Route::post('/login',    [PetClinicSessionController::class,    'store']);
        Route::get('/register',  [RegisteredPetClinicController::class, 'create'])->name('register');
        Route::post('/register', [RegisteredPetClinicController::class, 'store']);
    });

    Route::middleware('auth:pet_clinic')->group(function () {
        Route::post('/logout', [PetClinicSessionController::class, 'destroy'])->name('logout');
    });
});
