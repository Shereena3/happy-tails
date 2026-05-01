<?php

// ═══════════════════════════════════════════════════════════════════
// Auth\PetOwnerSessionController  —  Login / Logout for Pet Owners
// ═══════════════════════════════════════════════════════════════════

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PetOwnerSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/pet-owner-login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::guard('pet_owner')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ])->onlyInput('email');
        }

        $owner = Auth::guard('pet_owner')->user();

        if (!$owner->is_active) {
            Auth::guard('pet_owner')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Your account has been deactivated. Please contact support.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('owner.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('pet_owner')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
