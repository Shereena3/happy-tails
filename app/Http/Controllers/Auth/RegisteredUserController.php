<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration form.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle a new student registration.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            // Normalize terms_accepted boolean coming from Inertia/React
            $request->merge([
                'terms_accepted' => filter_var($request->terms_accepted, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            ]);

            $request->validate([
                'name'           => ['required', 'string', 'max:255'],
                'student_id'     => ['required', 'string', 'max:50', 'unique:users,student_id'],
                'email'          => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
                'phone_number'   => ['nullable', 'string', 'max:30'],
                'password'       => ['required', 'confirmed', Rules\Password::defaults()],
                'terms_accepted' => ['required', 'accepted'],
            ], [
                'student_id.unique' => 'This student ID is already registered.',
                'email.unique'      => 'This email address is already in use.',
            ]);

            $user = User::create([
                'name'         => $request->name,
                'student_id'   => $request->student_id,
                'email'        => $request->email,
                'phone_number' => $request->phone_number,
                'password'     => Hash::make($request->password),
                'role'         => User::ROLE_STUDENT,   // always 'student' on self-registration
                'is_active'    => true,                 // active by default; admin can deactivate
            ]);

            event(new Registered($user));

            Auth::login($user);

            return redirect()
                ->route('student.dashboard')
                ->with('success', 'Registration successful! Welcome to the TSF Appointment Portal.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Re-throw so Laravel/Inertia can surface field errors normally
            throw $e;

        } catch (\Exception $e) {
            Log::error('Student registration error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['email' => 'Registration failed. Please try again.'])
                ->withInput();
        }
    }
}