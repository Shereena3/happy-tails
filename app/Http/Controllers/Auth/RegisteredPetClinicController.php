<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PetClinic;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredPetClinicController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/clinic-register');
    }

    public function store(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'clinic_name'  => ['required', 'string', 'max:255'],
                'email'        => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:pet_clinics,email'],
                'phone_number' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{7,20}$/'],
                'address'      => ['nullable', 'string', 'max:500'],
                'password'     => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            ], [
                'clinic_name.required' => 'Clinic name is required.',
                'email.unique'         => 'This email address is already registered.',
                'phone_number.regex'   => 'Enter a valid phone number.',
                'password.confirmed'   => 'Passwords do not match.',
            ]);

            $clinic = PetClinic::create([
                'clinic_name'  => $request->clinic_name,
                'email'        => $request->email,
                'phone_number' => $request->phone_number,
                'address'      => $request->address,
                'password'     => Hash::make($request->password),
                'is_active'    => true,
            ]);

            event(new Registered($clinic));
            Auth::guard('pet_clinic')->login($clinic);

            return redirect()->route('clinic.dashboard')
                ->with('success', 'Welcome to Happy Tails! Your clinic account has been created.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Pet clinic registration error', ['message' => $e->getMessage()]);
            return back()->withErrors(['email' => 'Registration failed. Please try again.'])->withInput();
        }
    }
}
