<?php

// ═══════════════════════════════════════════════════════════════════
// Auth\PetClinicSessionController  —  Login / Logout for Pet Clinics
// ═══════════════════════════════════════════════════════════════════

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PetClinicSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/clinic-login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::guard('pet_clinic')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ])->onlyInput('email');
        }

        $clinic = Auth::guard('pet_clinic')->user();

        if (!$clinic->is_active) {
            Auth::guard('pet_clinic')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'This clinic account has been deactivated.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('clinic.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('pet_clinic')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
