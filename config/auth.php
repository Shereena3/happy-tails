<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    | Default guard: 'web' (TSF Student Portal — uses the users table)
    */

    'defaults' => [
        'guard'     => 'web',
        'passwords' => 'users',
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | web        → TSF students & admins  (users table)
    | pet_owner  → Happy Tails pet owners (pet_owners table)
    | pet_clinic → Happy Tails vet clinics (pet_clinics table)
    |
    */

    'guards' => [


        // ── Happy Tails — Pet Owner ────────────────────────────────────────
        'pet_owner' => [
            'driver'   => 'session',
            'provider' => 'pet_owners',
        ],

        // ── Happy Tails — Pet Clinic ───────────────────────────────────────
        'pet_clinic' => [
            'driver'   => 'session',
            'provider' => 'pet_clinics',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | Each provider points to its own Eloquent model and table.
    |
    */

    'providers' => [

        // TSF users (students + admins)
        'users' => [
            'driver' => 'eloquent',
            'model'  => App\Models\User::class,
        ],

        // Happy Tails pet owners
        'pet_owners' => [
            'driver' => 'eloquent',
            'model'  => App\Models\PetOwner::class,
        ],

        // Happy Tails vet clinics
        'pet_clinics' => [
            'driver' => 'eloquent',
            'model'  => App\Models\PetClinic::class,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | Each broker is independent so a pet owner reset link cannot be used
    | on a clinic account, and vice versa.
    |
    */

    'passwords' => [

        // TSF users
        'users' => [
            'provider' => 'users',
            'table'    => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire'   => 60,
            'throttle' => 60,
        ],

        // Pet owners
        'pet_owners' => [
            'provider' => 'pet_owners',
            'table'    => 'pet_owner_password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],

        // Pet clinics
        'pet_clinics' => [
            'provider' => 'pet_clinics',
            'table'    => 'pet_clinic_password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];