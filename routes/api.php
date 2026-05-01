<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PetOwnerController;
use App\Http\Controllers\PetClinicController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\VaccinationController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\GroomingSessionController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\NotificationController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

// ═══════════════════════════════════════════════════════════════════════════════
// PET OWNER  (guard: auth:pet_owner)
// ═══════════════════════════════════════════════════════════════════════════════

Route::middleware([EnsureFrontendRequestsAreStateful::class, 'auth:pet_owner'])
    ->prefix('owner')
    ->name('owner.api.')
    ->group(function () {

    Route::get('/user', fn(Request $r) => $r->user('pet_owner'));

    // ── Dashboard ─────────────────────────────────────────────────────────────
    // GET /api/owner/dashboard?lat=&lng=
    Route::get('/dashboard', [PetOwnerController::class, 'dashboard']);

    // ── Profile ───────────────────────────────────────────────────────────────
    Route::get('/profile',                         [PetOwnerController::class, 'profile']);
    Route::match(['put','post'], '/profile',        [PetOwnerController::class, 'updateProfile']);
    Route::delete('/account',                      [PetOwnerController::class, 'destroy']);

    // ── Pets ──────────────────────────────────────────────────────────────────
    Route::prefix('pets')->name('pets.')->group(function () {
        Route::get('/',                            [PetController::class, 'index']);
        Route::post('/',                           [PetController::class, 'store']);
        Route::get('/{petId}',                     [PetController::class, 'show']);
        Route::match(['put','post'], '/{petId}',   [PetController::class, 'update']);
        Route::delete('/{petId}',                  [PetController::class, 'destroy']);

        // Vaccinations
        Route::prefix('/{petId}/vaccinations')->name('vaccinations.')->group(function () {
            Route::get('/',        [VaccinationController::class, 'index']);
            Route::post('/',       [VaccinationController::class, 'store']);
            Route::get('/{id}',    [VaccinationController::class, 'show']);
            Route::put('/{id}',    [VaccinationController::class, 'update']);
            Route::delete('/{id}', [VaccinationController::class, 'destroy']);
        });

        // Medicines
        Route::prefix('/{petId}/medicines')->name('medicines.')->group(function () {
            Route::get('/',        [MedicineController::class, 'index']);
            Route::post('/',       [MedicineController::class, 'store']);
            Route::get('/{id}',    [MedicineController::class, 'show']);
            Route::put('/{id}',    [MedicineController::class, 'update']);
            Route::delete('/{id}', [MedicineController::class, 'destroy']);
        });

        // Grooming
        Route::prefix('/{petId}/grooming')->name('grooming.')->group(function () {
            Route::get('/',        [GroomingSessionController::class, 'index']);
            Route::post('/',       [GroomingSessionController::class, 'store']);
            Route::get('/{id}',    [GroomingSessionController::class, 'show']);
            Route::put('/{id}',    [GroomingSessionController::class, 'update']);
            Route::delete('/{id}', [GroomingSessionController::class, 'destroy']);
        });
    });

    // ── Reminders ─────────────────────────────────────────────────────────────
    Route::prefix('reminders')->name('reminders.')->group(function () {
        Route::get('/',           [ReminderController::class, 'index']);
        Route::post('/',          [ReminderController::class, 'store']);
        Route::get('/{id}',       [ReminderController::class, 'show']);
        Route::put('/{id}',       [ReminderController::class, 'update']);
        Route::post('/{id}/done', [ReminderController::class, 'markDone']);
        Route::delete('/{id}',    [ReminderController::class, 'destroy']);
    });

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/unread-count',          [NotificationController::class, 'unreadCount']);
        Route::post('/mark-all-read',        [NotificationController::class, 'markAllAsRead']);
        Route::get('/',                      [NotificationController::class, 'index']);
        Route::get('/{id}',                  [NotificationController::class, 'show']);
        Route::post('/{id}/mark-read',       [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}',               [NotificationController::class, 'destroy']);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PET CLINIC  (guard: auth:pet_clinic)
// ═══════════════════════════════════════════════════════════════════════════════

Route::middleware([EnsureFrontendRequestsAreStateful::class, 'auth:pet_clinic'])
    ->prefix('clinic')
    ->name('clinic.api.')
    ->group(function () {

    Route::get('/user', fn(Request $r) => $r->user('pet_clinic'));

    // ── Clinic own profile ────────────────────────────────────────────────────
    Route::get('/profile',                        [PetClinicController::class, 'profile']);
    Route::match(['put','post'], '/profile',       [PetClinicController::class, 'updateProfile']);
    Route::post('/toggle-active',                 [PetClinicController::class, 'toggleActive']);

    // ── Dashboard stats ───────────────────────────────────────────────────────
    // GET /api/clinic/dashboard — aggregate counts: owners, pets, reminders, etc.
    Route::get('/dashboard', [PetClinicController::class, 'clinicDashboard']);

    // ── Pet Owners (read-only) ────────────────────────────────────────────────
    // Clinic can list and view all registered pet owners.
    Route::prefix('owners')->name('owners.')->group(function () {
        Route::get('/',     [PetOwnerController::class, 'indexForClinic']);  // list all owners
        Route::get('/{id}', [PetOwnerController::class, 'showForClinic']);   // view single owner + their pets
    });

    // ── Pets (read + write — clinic monitors and records health data) ──────────
    // Clinic reads all pets; writes go to the same controllers but via clinic guard
    Route::prefix('pets')->name('pets.')->group(function () {
        Route::get('/',        [PetController::class, 'indexForClinic']);    // list all pets across all owners
        Route::get('/{petId}', [PetController::class, 'showForClinic']);     // view pet profile

        // Vaccinations — clinic can add / edit / delete records
        Route::prefix('/{petId}/vaccinations')->name('vaccinations.')->group(function () {
            Route::get('/',        [VaccinationController::class, 'indexForClinic']);
            Route::post('/',       [VaccinationController::class, 'storeForClinic']);
            Route::get('/{id}',    [VaccinationController::class, 'show']);
            Route::put('/{id}',    [VaccinationController::class, 'updateForClinic']);
            Route::delete('/{id}', [VaccinationController::class, 'destroyForClinic']);
        });

        // Medicines — clinic can add / edit / delete records
        Route::prefix('/{petId}/medicines')->name('medicines.')->group(function () {
            Route::get('/',        [MedicineController::class, 'indexForClinic']);
            Route::post('/',       [MedicineController::class, 'storeForClinic']);
            Route::get('/{id}',    [MedicineController::class, 'show']);
            Route::put('/{id}',    [MedicineController::class, 'updateForClinic']);
            Route::delete('/{id}', [MedicineController::class, 'destroyForClinic']);
        });

        // Grooming — clinic can log / edit / delete sessions
        Route::prefix('/{petId}/grooming')->name('grooming.')->group(function () {
            Route::get('/',        [GroomingSessionController::class, 'indexForClinic']);
            Route::post('/',       [GroomingSessionController::class, 'storeForClinic']);
            Route::get('/{id}',    [GroomingSessionController::class, 'show']);
            Route::put('/{id}',    [GroomingSessionController::class, 'updateForClinic']);
            Route::delete('/{id}', [GroomingSessionController::class, 'destroyForClinic']);
        });
    });

    // ── Reminders (read-only — clinic monitors all pending / overdue reminders) ─
    Route::get('/reminders',     [ReminderController::class, 'indexForClinic']);   // all pending reminders across pets
    Route::get('/reminders/{id}',[ReminderController::class, 'show']);
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC (no auth)
// ═══════════════════════════════════════════════════════════════════════════════

// Pet owners browse clinics on the home dashboard map (no login required)
Route::prefix('clinics')->name('clinics.')->group(function () {
    Route::get('/',     [PetClinicController::class, 'index']);   // list / nearby (?lat=&lng=&radius=)
    Route::get('/{id}', [PetClinicController::class, 'show']);    // public clinic profile
});