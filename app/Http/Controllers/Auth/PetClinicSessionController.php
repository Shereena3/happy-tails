<?php

// ═══════════════════════════════════════════════════════════════════
// Auth\PetClinicSessionController  —  Login / Logout for Pet Clinics
// Guard  : pet_clinic
// Table  : pet_clinics  (email, password, is_active)
// Renders: auth/owner-login  (shared tab page — opens on 'clinic' tab)
// Note   : No public self-registration. Clinic accounts are created
//          by admin / seeder only.
// ═══════════════════════════════════════════════════════════════════

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PetClinicSessionController extends Controller
{
    // ── Show login form (clinic tab pre-selected) ──────────────────────────────

    public function create(Request $request): Response
    {
        return Inertia::render('auth/owner-login', [
            'status'    => session('status'),
            'activeTab' => 'clinic', // tells the React tab switcher to open clinic tab
        ]);
    }

    // ── Handle login attempt ───────────────────────────────────────────────────  

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Rate-limit: 5 attempts / minute per email + IP
        $throttleKey = 'clinic-login:' . Str::lower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ])->onlyInput('email');
        }

        if (! Auth::guard('pet_clinic')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            RateLimiter::hit($throttleKey);

            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ])->onlyInput('email');
        }

        /** @var \App\Models\PetClinic $clinic */
        $clinic = Auth::guard('pet_clinic')->user();

        // Block deactivated clinic accounts (is_active = false on pet_clinics table)
        if (! $clinic->is_active) {
            Auth::guard('pet_clinic')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'This clinic account has been deactivated. Please contact support.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        return redirect()->route('clinic.dashboard');
    }

    // ── Logout ─────────────────────────────────────────────────────────────────

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('pet_clinic')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}