<?php

namespace App\Http\Controllers;

use App\Models\PetClinic;
use App\Models\PetOwner;
use App\Models\Pet;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PetClinicController extends Controller
{
    private function unauthenticated(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Unauthenticated. Please log in.'], 401);
    }

    private function unauthorized(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
    }

    private function getOwner(Request $request): ?\App\Models\PetOwner
    {
        return $request->user('pet_owner');
    }

    private function getClinic(Request $request): ?\App\Models\PetClinic
    {
        return $request->user('pet_clinic');
    }

    // =========================================================================
    // index — pet owners browse nearby / all clinics
    // =========================================================================

    public function index(Request $request)
    {
        try {
            $query = PetClinic::active();

            if ($search = $request->input('search')) {
                $query->search($search);
            }

            // Nearby filter — requires lat & lng from client (e.g. browser geolocation)
            $lat    = $request->input('lat');
            $lng    = $request->input('lng');
            $radius = $request->input('radius', 10); // km

            if ($lat && $lng) {
                $query->nearby((float) $lat, (float) $lng, (float) $radius);
            } else {
                $query->orderBy('clinic_name');
            }

            $clinics = $query->get(['id', 'clinic_name', 'address', 'phone_number',
                                    'latitude', 'longitude', 'profile_photo_path'])
                ->each(fn($c) => $c->append(['profile_photo_url']));

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $clinics]);
            }

            return Inertia::render('Owner/Clinics/Index', [
                'clinics' => $clinics,
                'filters' => $request->only(['search', 'lat', 'lng', 'radius']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching clinics: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve clinics'], 500)
                : back()->with('error', 'Failed to retrieve clinics');
        }
    }

    // =========================================================================
    // show — public clinic profile (visible to pet owners)
    // =========================================================================

    public function show(Request $request, $id)
    {
        try {
            $clinic = PetClinic::findOrFail($id);
            $clinic->append(['profile_photo_url']);

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $clinic]);
            }

            return Inertia::render('Owner/Clinics/Show', ['clinic' => $clinic]);

        } catch (\Exception $e) {
            Log::error('Error fetching clinic: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Clinic not found'], 404)
                : back()->with('error', 'Clinic not found');
        }
    }

    // =========================================================================
    // clinicDashboard — aggregate stats for clinic dashboard
    // =========================================================================

    public function clinicDashboard(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return $request->expectsJson() 
                    ? response()->json(['success' => false, 'message' => 'Unauthenticated'], 401)
                    : redirect()->route('clinic.login');
            }

            // Get all pet owners (clinic can see all registered owners)
            $totalOwners = PetOwner::count();
            
            // Get all pets
            $totalPets = Pet::count();
            
            // Get overdue reminders (is_done = false and remind_at < now)
            $overdueReminders = Reminder::where('is_done', false)
                ->where('remind_at', '<', now())
                ->count();
            
            // Get pending reminders (is_done = false and remind_at >= now)
            $pendingReminders = Reminder::where('is_done', false)
                ->where('remind_at', '>=', now())
                ->count();

            $data = [
                'total_owners' => $totalOwners,
                'total_pets' => $totalPets,
                'overdue_reminders' => $overdueReminders,
                'pending_reminders' => $pendingReminders,
            ];

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $data]);
            }

            return Inertia::render('Clinic/Dashboard', $data);

        } catch (\Exception $e) {
            Log::error('Error fetching clinic dashboard: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to load dashboard'], 500)
                : back()->with('error', 'Failed to load dashboard');
        }
    }

    // =========================================================================
    // profile — authenticated clinic views/returns its own profile
    // =========================================================================

    public function profile(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) return $this->unauthenticated();

            $clinic->append(['profile_photo_url']);

            return response()->json(['success' => true, 'data' => $clinic]);

        } catch (\Exception $e) {
            Log::error('Error fetching clinic profile: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch profile'], 500);
        }
    }

    // =========================================================================
    // updateProfile — authenticated clinic updates its own profile
    // =========================================================================

    public function updateProfile(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) return $this->unauthenticated();

            $validator = Validator::make($request->all(), [
                'clinic_name'  => 'sometimes|required|string|max:255',
                'email'        => 'sometimes|required|email|unique:pet_clinics,email,' . $clinic->id,
                'phone_number' => 'nullable|string|max:30',
                'address'      => 'nullable|string|max:500',
                'latitude'     => 'nullable|numeric|between:-90,90',
                'longitude'    => 'nullable|numeric|between:-180,180',
                'password'     => ['nullable', 'string', 'min:8', 'confirmed',
                                   'regex:/[A-Z]/', 'regex:/[0-9]/'],
                'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            ], [
                'password.regex' => 'Password must contain at least one uppercase letter and one number.',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();

            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            unset($data['profile_photo']);

            if ($request->hasFile('profile_photo')) {
                if ($clinic->profile_photo_path) {
                    Storage::disk('public')->delete($clinic->profile_photo_path);
                }
                $data['profile_photo_path'] = $request->file('profile_photo')
                    ->store('clinic-photos', 'public');
            } elseif ($request->input('remove_profile_photo')) {
                if ($clinic->profile_photo_path) {
                    Storage::disk('public')->delete($clinic->profile_photo_path);
                }
                $data['profile_photo_path'] = null;
            }

            $clinic->update($data);
            $clinic->append(['profile_photo_url']);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data'    => $clinic->fresh()->append(['profile_photo_url']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating clinic profile: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update profile', 'error' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // toggleActive — deactivate / reactivate a clinic (self-service)
    // =========================================================================

    public function toggleActive(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) return $this->unauthenticated();

            $clinic->is_active ? $clinic->deactivate() : $clinic->activate();

            $status = $clinic->fresh()->is_active ? 'activated' : 'deactivated';

            return response()->json([
                'success' => true,
                'data'    => $clinic->fresh()->append(['profile_photo_url']),
                'message' => "Clinic account {$status} successfully",
            ]);

        } catch (\Exception $e) {
            Log::error('Error toggling clinic status: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update clinic status'], 500);
        }
    }
}