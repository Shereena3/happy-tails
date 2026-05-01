<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PetOwner;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredPetOwnerController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/owner-register', [
            'suffixes' => PetOwner::SUFFIXES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'last_name'    => ['required', 'string', 'max:100'],
                'first_name'   => ['required', 'string', 'max:100'],
                'middle_name'  => ['nullable', 'string', 'max:100'],
                'suffix'       => ['nullable', 'string', Rule::in(array_merge([''], PetOwner::SUFFIXES))],
                'email'        => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:pet_owners,email'],
                'phone_number' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{7,20}$/'],
                'address'      => ['nullable', 'string', 'max:500'],
                'password'     => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            ], [
                'last_name.required'  => 'Last name is required.',
                'first_name.required' => 'First name is required.',
                'email.unique'        => 'This email address is already registered.',
                'phone_number.regex'  => 'Enter a valid phone number.',
                'password.confirmed'  => 'Passwords do not match.',
            ]);

            $owner = PetOwner::create([
                'last_name'    => $request->last_name,
                'first_name'   => $request->first_name,
                'middle_name'  => $request->middle_name,
                'suffix'       => $request->suffix ?: null,
                'email'        => $request->email,
                'phone_number' => $request->phone_number,
                'address'      => $request->address,
                'password'     => Hash::make($request->password),
                'is_active'    => true,
            ]);

            event(new Registered($owner));
            Auth::guard('pet_owner')->login($owner);

            return redirect()->route('owner.dashboard')
                ->with('success', 'Welcome to Happy Tails! Your account has been created.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Pet owner registration error', ['message' => $e->getMessage()]);
            return back()->withErrors(['email' => 'Registration failed. Please try again.'])->withInput();
        }
    }
}
