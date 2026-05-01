<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PetController extends Controller
{
    private function unauthenticated(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Unauthenticated. Please log in.'], 401);
    }

    private function unauthorized(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Unauthorized access.'], 403);
    }

    /**
     * Resolve the authenticated pet owner from the guard.
     */
    private function getOwner(Request $request): ?\App\Models\PetOwner
    {
        return $request->user('pet_owner');
    }

    // =========================================================================
    // index — list all pets for the authenticated owner
    // =========================================================================

    public function index(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $query = Pet::forOwner($owner->id);

            if ($search = $request->input('search')) {
                $query->search($search);
            }
            if ($species = $request->input('species')) {
                $query->where('species', $species);
            }
            if ($request->has('is_active')) {
                $request->boolean('is_active') ? $query->active() : $query->inactive();
            }

            $query->orderBy('name');
            $pets = $query->get()->each(fn($p) => $p->append(['photo_url', 'age_string']));

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $pets]);
            }

            return Inertia::render('Owner/Pets/Index', [
                'pets'    => $pets,
                'filters' => $request->only(['search', 'species', 'is_active']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching pets: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve pets', 'error' => $e->getMessage()], 500)
                : back()->with('error', 'Failed to retrieve pets');
        }
    }

    // =========================================================================
    // store — owner adds a new pet
    // =========================================================================

    public function store(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $validator = Validator::make($request->all(), [
                'name'     => 'required|string|max:100',
                'species'  => ['required', Rule::in(Pet::getSpecies())],
                'breed'    => 'nullable|string|max:100',
                'sex'      => ['nullable', Rule::in(Pet::getSexOptions())],
                'birthday' => 'nullable|date|before_or_equal:today',
                'photo'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            ], [
                'birthday.before_or_equal' => 'Birthday cannot be in the future.',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $photoPath = $request->hasFile('photo')
                ? $request->file('photo')->store('pet-photos', 'public')
                : null;

            $pet = Pet::create([
                'pet_owner_id' => $owner->id,
                'name'         => $request->name,
                'species'      => $request->species,
                'breed'        => $request->breed,
                'sex'          => $request->sex,
                'birthday'     => $request->birthday,
                'photo_path'   => $photoPath,
                'is_active'    => true,
            ]);

            $pet->append(['photo_url', 'age_string']);

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $pet, 'message' => 'Pet added successfully!'], 201)
                : redirect()->route('owner.pets.index')->with('success', 'Pet added successfully!');

        } catch (\Exception $e) {
            Log::error('Error creating pet: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to add pet', 'error' => $e->getMessage()], 500)
                : back()->with('error', 'Failed to add pet')->withInput();
        }
    }

    // =========================================================================
    // show — view a pet's full profile with health summary
    // =========================================================================

    public function show(Request $request, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $pet = Pet::with(['vaccinations', 'medicines', 'groomingSessions', 'reminders'])
                ->findOrFail($id);

            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized access');
            }

            $pet->append(['photo_url', 'age', 'age_string']);

            $data                  = $pet->toArray();
            $data['health_summary'] = $pet->getHealthSummary();
            $data['upcoming_reminders'] = $pet->getUpcomingReminders();

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $data]);
            }

            return Inertia::render('Owner/Pets/Show', ['pet' => $data]);

        } catch (\Exception $e) {
            Log::error('Error fetching pet: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Pet not found'], 404)
                : back()->with('error', 'Pet not found');
        }
    }

    // =========================================================================
    // update — owner edits a pet's profile
    // =========================================================================

    public function update(Request $request, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $pet = Pet::findOrFail($id);

            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized access');
            }

            $validator = Validator::make($request->all(), [
                'name'     => 'required|string|max:100',
                'species'  => ['required', Rule::in(Pet::getSpecies())],
                'breed'    => 'nullable|string|max:100',
                'sex'      => ['nullable', Rule::in(Pet::getSexOptions())],
                'birthday' => 'nullable|date|before_or_equal:today',
                'photo'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $updateData = [
                'name'     => $request->name,
                'species'  => $request->species,
                'breed'    => $request->breed,
                'sex'      => $request->sex,
                'birthday' => $request->birthday,
            ];

            if ($request->hasFile('photo')) {
                if ($pet->photo_path) {
                    Storage::disk('public')->delete($pet->photo_path);
                }
                $updateData['photo_path'] = $request->file('photo')->store('pet-photos', 'public');
            } elseif ($request->input('remove_photo')) {
                if ($pet->photo_path) {
                    Storage::disk('public')->delete($pet->photo_path);
                }
                $updateData['photo_path'] = null;
            }

            $pet->update($updateData);
            $pet->append(['photo_url', 'age_string']);

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $pet->fresh()->append(['photo_url', 'age_string']), 'message' => 'Pet updated successfully'])
                : redirect()->route('owner.pets.show', $pet->id)->with('success', 'Pet updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating pet: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to update pet', 'error' => $e->getMessage()], 500)
                : back()->with('error', 'Failed to update pet')->withInput();
        }
    }


    // Add this method to your PetController class (after the existing methods)

// =========================================================================
// indexForClinic — list pets for a clinic (patients)
// =========================================================================

public function indexForClinic(Request $request)
{
    try {
        $clinic = $request->user('pet_clinic');
        if (!$clinic) {
            return $request->expectsJson() 
                ? response()->json(['success' => false, 'message' => 'Unauthenticated'], 401)
                : redirect()->route('clinic.login');
        }

        $query = Pet::query();

        // Optional filters
        if ($search = $request->input('search')) {
            $query->search($search);
        }
        if ($species = $request->input('species')) {
            $query->where('species', $species);
        }
        if ($request->has('is_active')) {
            $request->boolean('is_active') ? $query->active() : $query->inactive();
        }

        // Eager load owner info
        $query->with('owner');
        $query->orderBy('name');
        
        $pets = $query->get()->each(fn($p) => $p->append(['photo_url', 'age_string']));

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'data' => $pets]);
        }

        return Inertia::render('Clinic/Pets/Index', [
            'pets'    => $pets,
            'filters' => $request->only(['search', 'species', 'is_active']),
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching pets for clinic: ' . $e->getMessage());
        return $request->expectsJson()
            ? response()->json(['success' => false, 'message' => 'Failed to retrieve pets'], 500)
            : back()->with('error', 'Failed to retrieve pets');
    }
}

// =========================================================================
// showForClinic — view a specific pet's details (for clinic view)
// =========================================================================

public function showForClinic($petId)
{
    $pet = \App\Models\Pet::with([
        'owner',
        'vaccinations',
        'medicines',
        'groomingSessions',
        'reminders'
    ])->find($petId);

    if (!$pet) {
        return response()->json([
            'success' => false,
            'message' => 'Pet not found',
        ]);
    }

    // VERY IMPORTANT (same as owner view)
    $pet->append(['photo_url', 'age', 'age_string']);

    $data = $pet->toArray();
    $data['health_summary'] = $pet->getHealthSummary();
    $data['upcoming_reminders'] = $pet->getUpcomingReminders();

    return response()->json([
        'success' => true,
        'data' => $data,
    ]);
}


    // =========================================================================
    // destroy — owner removes a pet (archive only if it has records)
    // =========================================================================

    public function destroy(Request $request, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $pet = Pet::findOrFail($id);

            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized access');
            }

            $hasRecords = $pet->vaccinations()->exists()
                || $pet->medicines()->exists()
                || $pet->groomingSessions()->exists();

            if ($hasRecords) {
                // Soft-archive instead of hard-delete to preserve health history
                $pet->archive();
                $message = "{$pet->name}'s profile has been archived.";
            } else {
                if ($pet->photo_path) {
                    Storage::disk('public')->delete($pet->photo_path);
                }
                $pet->delete();
                $message = "{$pet->name}'s profile has been removed.";
            }

            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => $message])
                : redirect()->route('owner.pets.index')->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Error deleting pet: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to remove pet', 'error' => $e->getMessage()], 500)
                : back()->with('error', 'Failed to remove pet');
        }
    }
}
