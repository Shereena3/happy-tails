<?php

// ═══════════════════════════════════════════════════════════════════
// Auth\PetOwnerSessionController  —  Login / Logout for Pet Owners
// Guard  : pet_owner
// Table  : pet_owners  (email, password, is_active)
// Renders: auth/owner-login  (shared tab page with clinic)
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

class PetOwnerSessionController extends Controller
{
    // ── Show login form ────────────────────────────────────────────────────────

    public function create(Request $request): Response
    {
        return Inertia::render('auth/owner-login', [
            'status'    => session('status'),
            'activeTab' => 'owner', // tells the React tab switcher which tab to open
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
        $throttleKey = 'owner-login:' . Str::lower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ])->onlyInput('email');
        }

        if (! Auth::guard('pet_owner')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            RateLimiter::hit($throttleKey);

            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ])->onlyInput('email');
        }

        /** @var \App\Models\PetOwner $owner */
        $owner = Auth::guard('pet_owner')->user();

        // Block deactivated accounts (is_active = false on pet_owners table)
        if (! $owner->is_active) {
            Auth::guard('pet_owner')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Your account has been deactivated. Please contact support.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        return redirect()->route('owner.dashboard');
    }

    // ── Logout ─────────────────────────────────────────────────────────────────

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('pet_owner')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}