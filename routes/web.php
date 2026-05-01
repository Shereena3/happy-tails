<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Redirect old/default auth pages to Happy Tails owner login
Route::get('/login', function () {
    return redirect()->route('owner.login');
})->name('login');

Route::get('/register', function () {
    return redirect()->route('owner.register');
})->name('register');

// ─── Landing page ─────────────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// ═══════════════════════════════════════════════════════════════════════════════
// PET OWNER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

Route::prefix('owner')->name('owner.')->group(function () {
            Route::get('/login', [\App\Http\Controllers\Auth\PetOwnerSessionController::class, 'create'])
            ->name('login');

        Route::post('/login', [\App\Http\Controllers\Auth\PetOwnerSessionController::class, 'store']);

        Route::get('/register', [\App\Http\Controllers\Auth\RegisteredPetOwnerController::class, 'create'])
            ->name('register');

        Route::post('/register', [\App\Http\Controllers\Auth\RegisteredPetOwnerController::class, 'store']);

        Route::post('/logout', [\App\Http\Controllers\Auth\PetOwnerSessionController::class, 'destroy'])
            ->middleware('auth:pet_owner')
            ->name('logout');
            
    Route::middleware('auth:pet_owner')->group(function () {

        Route::get('/dashboard', fn() => Inertia::render('Owner/Dashboard'))
            ->name('dashboard');

        Route::prefix('pets')->name('pets.')->group(function () {
            Route::get('/', fn() => Inertia::render('Owner/Pets/Index'))->name('index');
            Route::get('/create', fn() => Inertia::render('Owner/Pets/Create'))->name('create');
            Route::get('/{id}', fn($id) => Inertia::render('Owner/Pets/Show', ['petId' => $id]))->name('show');
            Route::get('/{id}/edit', fn($id) => Inertia::render('Owner/Pets/Edit', ['petId' => $id]))->name('edit');

            Route::prefix('/{petId}/vaccinations')->name('vaccinations.')->group(function () {
                Route::get('/', fn($petId) => Inertia::render('Owner/Vaccinations/Index', ['petId' => $petId]))->name('index');
                Route::get('/create', fn($petId) => Inertia::render('Owner/Vaccinations/Create', ['petId' => $petId]))->name('create');
                Route::get('/{id}/edit', fn($petId, $id) => Inertia::render('Owner/Vaccinations/Edit', ['petId' => $petId, 'vaccinationId' => $id]))->name('edit');
            });

            Route::prefix('/{petId}/medicines')->name('medicines.')->group(function () {
                Route::get('/', fn($petId) => Inertia::render('Owner/Medicines/Index', ['petId' => $petId]))->name('index');
                Route::get('/create', fn($petId) => Inertia::render('Owner/Medicines/Create', ['petId' => $petId]))->name('create');
                Route::get('/{id}/edit', fn($petId, $id) => Inertia::render('Owner/Medicines/Edit', ['petId' => $petId, 'medicineId' => $id]))->name('edit');
            });

            Route::prefix('/{petId}/grooming')->name('grooming.')->group(function () {
                Route::get('/', fn($petId) => Inertia::render('Owner/Grooming/Index', ['petId' => $petId]))->name('index');
                Route::get('/create', fn($petId) => Inertia::render('Owner/Grooming/Create', ['petId' => $petId]))->name('create');
                Route::get('/{id}/edit', fn($petId, $id) => Inertia::render('Owner/Grooming/Edit', ['petId' => $petId, 'sessionId' => $id]))->name('edit');
            });
        });

        Route::prefix('reminders')->name('reminders.')->group(function () {
            Route::get('/', fn() => Inertia::render('Owner/Reminders/Index'))->name('index');
            Route::get('/create', fn() => Inertia::render('Owner/Reminders/Create'))->name('create');
            Route::get('/{id}/edit', fn($id) => Inertia::render('Owner/Reminders/Edit', ['reminderId' => $id]))->name('edit');
        });

        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', fn() => Inertia::render('Owner/Notifications/Index'))->name('index');
            Route::get('/{id}', fn($id) => Inertia::render('Owner/Notifications/Show', ['notificationId' => $id]))->name('show');
        });

        Route::get('/profile', fn() => Inertia::render('Owner/Profile'))->name('profile');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PET CLINIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

Route::prefix('clinic')->name('clinic.')->group(function () {

Route::get('/pets/{id}', function ($id) {
    return Inertia::render('Clinic/Pets/Show', [
        'id' => $id,
    ]);
})->name('pets.show');

    Route::middleware('guest:pet_clinic')->group(function () {
        Route::get('/login', [\App\Http\Controllers\Auth\PetClinicSessionController::class, 'create'])
            ->name('login');

        Route::post('/login', [\App\Http\Controllers\Auth\PetClinicSessionController::class, 'store']);
    });

    Route::post('/logout', [\App\Http\Controllers\Auth\PetClinicSessionController::class, 'destroy'])
        ->middleware('auth:pet_clinic')
        ->name('logout');

    Route::middleware('auth:pet_clinic')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('Clinic/Dashboard'))->name('dashboard');

        Route::prefix('owners')->name('owners.')->group(function () {
            Route::get('/', fn() => Inertia::render('Clinic/Owners/Index'))->name('index');
            Route::get('/{id}', fn($id) => Inertia::render('Clinic/Owners/Show', ['ownerId' => $id]))->name('show');
        });

        Route::prefix('pets')->name('pets.')->group(function () {
            Route::get('/', fn() => Inertia::render('Clinic/Pets/Index'))->name('index');
            Route::get('/{id}', fn($id) => Inertia::render('Clinic/Pets/Show', ['petId' => $id]))->name('show');
        });

        Route::get('/reminders', fn() => Inertia::render('Clinic/Reminders/Index'))->name('reminders.index');
        Route::get('/profile', fn() => Inertia::render('Clinic/Profile'))->name('profile');
        Route::get('/profile/edit', fn() => Inertia::render('Clinic/ProfileEdit'))->name('profile.edit');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC CLINICS
// ═══════════════════════════════════════════════════════════════════════════════

Route::prefix('clinics')->name('clinics.')->group(function () {
    Route::get('/', fn() => Inertia::render('Owner/Clinics/Index'))->name('index');
    Route::get('/{id}', fn($id) => Inertia::render('Owner/Clinics/Show', ['clinicId' => $id]))->name('show');
});

// IMPORTANT:
// Do NOT require auth.php because it loads the old /login UI.
// require __DIR__ . '/auth.php';