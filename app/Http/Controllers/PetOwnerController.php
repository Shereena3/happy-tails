<?php

namespace App\Http\Controllers;

use App\Models\PetOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PetOwnerController extends Controller
{
    private function unauthenticated(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Unauthenticated. Please log in.'], 401);
    }

    private function getOwner(Request $request): ?\App\Models\PetOwner
    {
        return $request->user('pet_owner');
    }

    /**
     * Store a new profile photo and delete the old one.
     */
    private function storeProfilePhoto(Request $request, PetOwner $owner): ?string
    {
        if (!$request->hasFile('profile_photo')) return null;

        if ($owner->profile_photo_path) {
            Storage::disk('public')->delete($owner->profile_photo_path);
        }

        return $request->file('profile_photo')->store('owner-photos', 'public');
    }

    /**
     * Delete the owner's profile photo and clear the column.
     */
    private function removeProfilePhoto(PetOwner $owner): void
    {
        if ($owner->profile_photo_path) {
            Storage::disk('public')->delete($owner->profile_photo_path);
            $owner->update(['profile_photo_path' => null]);
        }
    }

    // =========================================================================
    // dashboard — home screen data: pets + nearby clinics + reminders
    // =========================================================================

    public function dashboard(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $owner->append(['name', 'profile_photo_url']);

            $pets = $owner->pets()
                ->active()
                ->with(['reminders' => fn($q) => $q->pending()->orderBy('remind_at')])
                ->get()
                ->each(fn($p) => $p->append(['photo_url', 'age_string']));

            // Upcoming reminders across all pets (next 7 days)
            $petIds = $pets->pluck('id')->toArray();
            $upcomingReminders = \App\Models\Reminder::whereIn('pet_id', $petIds)
                ->dueSoon(7)
                ->with('pet')
                ->get();

            // Nearby clinics — optional, only if lat/lng provided by the client
            $nearbyClinics = collect();
            $lat = $request->input('lat');
            $lng = $request->input('lng');
            if ($lat && $lng) {
                $nearbyClinics = \App\Models\PetClinic::active()
                    ->nearby((float) $lat, (float) $lng, 10)
                    ->get(['id', 'clinic_name', 'address', 'phone_number',
                           'latitude', 'longitude', 'profile_photo_path'])
                    ->each(fn($c) => $c->append(['profile_photo_url']));
            }

            $stats = $owner->getDashboardStats();

            $data = [
                'owner'             => $owner,
                'stats'             => $stats,
                'pets'              => $pets,
                'upcoming_reminders'=> $upcomingReminders,
                'nearby_clinics'    => $nearbyClinics,
            ];

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $data]);
            }

            return Inertia::render('Owner/Dashboard', $data);

        } catch (\Exception $e) {
            Log::error('Error loading dashboard: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to load dashboard'], 500)
                : back()->with('error', 'Failed to load dashboard');
        }
    }

    // =========================================================================
    // profile — view the authenticated owner's profile
    // =========================================================================

    public function profile(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $owner->append(['name', 'profile_photo_url']);
            $stats = $owner->getDashboardStats();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data'    => array_merge($owner->toArray(), ['stats' => $stats]),
                ]);
            }

            return Inertia::render('Owner/Profile', [
                'owner' => $owner,
                'stats' => $stats,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching owner profile: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to fetch profile'], 500)
                : back()->with('error', 'Failed to fetch profile');
        }
    }

    // =========================================================================
    // updateProfile — owner updates their own profile (multipart)
    // =========================================================================

    public function updateProfile(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $validator = Validator::make($request->all(), [
                'last_name'     => 'sometimes|required|string|max:100',
                'first_name'    => 'sometimes|required|string|max:100',
                'middle_name'   => 'nullable|string|max:100',
                'suffix'        => ['nullable', 'string', Rule::in(array_merge([''], PetOwner::SUFFIXES))],
                'email'         => 'sometimes|required|email|unique:pet_owners,email,' . $owner->id,
                'phone_number'  => 'nullable|string|max:30|regex:/^[0-9+\-\s()]{7,20}$/',
                'address'       => 'nullable|string|max:500',
                'password'      => [
                    'nullable', 'string', 'min:8', 'confirmed',
                    'regex:/[A-Z]/', 'regex:/[0-9]/',
                ],
                'profile_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            ], [
                'last_name.required'  => 'Last name is required.',
                'first_name.required' => 'First name is required.',
                'password.regex'      => 'Password must contain at least one uppercase letter and one number.',
                'phone_number.regex'  => 'Enter a valid phone number.',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $data = $validator->validated();

            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            unset($data['profile_photo']);

            if ($request->hasFile('profile_photo')) {
                $data['profile_photo_path'] = $this->storeProfilePhoto($request, $owner);
            } elseif ($request->input('remove_profile_photo')) {
                $this->removeProfilePhoto($owner);
            }

            $owner->update($data);
            $owner->append(['name', 'profile_photo_url']);

            return $request->expectsJson()
                ? response()->json([
                    'success' => true,
                    'message' => 'Profile updated successfully',
                    'data'    => $owner->fresh()->append(['name', 'profile_photo_url']),
                ])
                : redirect()->back()->with('success', 'Profile updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating owner profile: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to update profile', 'error' => $e->getMessage()], 500)
                : back()->with('error', 'Failed to update profile')->withInput();
        }
    }
  public function indexForClinic(Request $request)
    {
        $query = PetOwner::query();
        
        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$search}%");
            });
        }
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        // With pets count
        $query->withCount('pets');
        
        // Pagination or all
        if ($request->has('per_page')) {
            $owners = $query->paginate($request->get('per_page', 15));
        } else {
            $owners = $query->get();
        }
        
        // Format owner names
        $owners->transform(function ($owner) {
            $owner->name = $owner->full_name;
            return $owner;
        });
        
        return response()->json([
            'success' => true,
            'data' => $owners,
            'message' => 'Owners retrieved successfully',
        ]);
    }

    /**
     * Display the specified pet owner for clinic view.
     * GET /api/clinic/owners/{id}
     */
    public function showForClinic(Request $request, $id)
    {
        $owner = PetOwner::with(['pets' => function ($query) {
            $query->withCount(['vaccinations', 'medicines', 'groomingSessions']);
        }])->find($id);
        
        if (!$owner) {
            return response()->json([
                'success' => false,
                'message' => 'Owner not found',
            ], 404);
        }
        
        // Add full name
        $owner->name = $owner->full_name;
        
        // Calculate statistics
        $stats = [
            'total_pets' => $owner->pets->count(),
            'active_pets' => $owner->pets->where('is_active', true)->count(),
            'total_vaccinations' => $owner->pets->sum(function ($pet) {
                return $pet->vaccinations_count ?? 0;
            }),
            'total_medicines' => $owner->pets->sum(function ($pet) {
                return $pet->medicines_count ?? 0;
            }),
            'total_grooming_sessions' => $owner->pets->sum(function ($pet) {
                return $pet->grooming_sessions_count ?? 0;
            }),
            'pending_reminders' => $owner->pets->sum(function ($pet) {
                return $pet->reminders()->where('is_done', false)->count();
            }),
        ];
        
        $owner->stats = $stats;
        
        // Format pets data
        $owner->pets->transform(function ($pet) {
            $pet->age_string = $pet->age_string;
            $pet->health_summary = [
                'vaccinations' => $pet->vaccinations_count ?? 0,
                'medicines' => $pet->medicines_count ?? 0,
                'grooming_sessions' => $pet->grooming_sessions_count ?? 0,
                'pending_reminders' => $pet->reminders()->where('is_done', false)->count(),
            ];
            return $pet;
        });
        
        return response()->json([
            'success' => true,
            'data' => $owner,
            'message' => 'Owner retrieved successfully',
        ]);
    }
    // =========================================================================
    // destroy — owner deletes their own account
    // =========================================================================

    public function destroy(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $request->validate([
                'password' => ['required', 'string'],
            ]);

            if (!Hash::check($request->password, $owner->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Incorrect password. Account not deleted.',
                ], 422);
            }

            // Clean up profile photo
            if ($owner->profile_photo_path) {
                Storage::disk('public')->delete($owner->profile_photo_path);
            }

            // Clean up pet photos
            foreach ($owner->pets as $pet) {
                if ($pet->photo_path) {
                    Storage::disk('public')->delete($pet->photo_path);
                }
            }

            $owner->delete(); // cascades to pets, reminders, notifications via DB

            return response()->json([
                'success' => true,
                'message' => 'Your account has been deleted.',
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting owner account: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to delete account'], 500);
        }
    }
}
