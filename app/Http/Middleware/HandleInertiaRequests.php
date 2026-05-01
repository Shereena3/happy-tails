<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * These are available in every Inertia page via usePage().props
     */
    public function share(Request $request): array
    {
        // ── Resolve authenticated user per guard ───────────────────────────────

        /** @var \App\Models\PetOwner|null */
        $owner = $request->user('pet_owner');

        /** @var \App\Models\PetClinic|null */
        $clinic = $request->user('pet_clinic');

        // ── Build owner payload ────────────────────────────────────────────────
        $ownerPayload = null;
        if ($owner) {
            $owner->append(['name', 'profile_photo_url']);
            $ownerPayload = [
                'id'                => $owner->id,
                'last_name'         => $owner->last_name,
                'first_name'        => $owner->first_name,
                'middle_name'       => $owner->middle_name,
                'suffix'            => $owner->suffix,
                'name'              => $owner->name,              // computed full name
                'email'             => $owner->email,
                'phone_number'      => $owner->phone_number,
                'profile_photo_url' => $owner->profile_photo_url,
                'is_active'         => $owner->is_active,
            ];
        }

        // ── Build clinic payload ───────────────────────────────────────────────
        $clinicPayload = null;
        if ($clinic) {
            $clinic->append(['profile_photo_url']);
            $clinicPayload = [
                'id'                => $clinic->id,
                'clinic_name'       => $clinic->clinic_name,
                'email'             => $clinic->email,
                'phone_number'      => $clinic->phone_number,
                'address'           => $clinic->address,
                'latitude'          => $clinic->latitude,
                'longitude'         => $clinic->longitude,
                'profile_photo_url' => $clinic->profile_photo_url,
                'is_active'         => $clinic->is_active,
            ];
        }

        return array_merge(parent::share($request), [

            // ── auth — consumed by AppHeader & all pages ───────────────────────
            'auth' => [
                'owner'  => $ownerPayload,   // null when not logged in as owner
                'clinic' => $clinicPayload,  // null when not logged in as clinic
            ],

            // ── flash messages ─────────────────────────────────────────────────
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info'    => $request->session()->get('info'),
            ],
        ]);
    }
}