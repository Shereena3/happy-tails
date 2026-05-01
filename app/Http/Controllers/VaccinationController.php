<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\Vaccination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class VaccinationController extends Controller
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

    /**
     * Verify the pet belongs to the authenticated owner. Returns the pet or aborts.
     */
    private function resolveOwnedPet(Request $request, int $petId)
    {
        $owner = $this->getOwner($request);
        if (!$owner) return $this->unauthenticated();

        $pet = Pet::findOrFail($petId);
        if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

        return $pet;
    }

    // =========================================================================
    // index — list all vaccinations for a pet (Owner)
    // =========================================================================

    public function index(Request $request, $petId)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized access');
            }

            $query = Vaccination::forPet($pet->id);

            if ($search = $request->input('search')) {
                $query->search($search);
            }

            $filter = $request->input('filter');
            match ($filter) {
                'overdue'  => $query->overdue(),
                'due_soon' => $query->dueSoon(),
                default    => null,
            };

            $vaccinations = $query->orderByDesc('date_administered')->get();

            // Add formatted dates
            $vaccinations->each(function ($v) {
                $v->formatted_date_administered = $v->getFormattedDateAdministered();
                $v->formatted_next_due_date = $v->getFormattedNextDueDate();
            });

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $vaccinations]);
            }

            return Inertia::render('Owner/Vaccinations/Index', [
                'pet'          => $pet->append(['photo_url']),
                'vaccinations' => $vaccinations,
                'filters'      => $request->only(['search', 'filter']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching vaccinations: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve vaccinations'], 500)
                : back()->with('error', 'Failed to retrieve vaccinations');
        }
    }

    // =========================================================================
    // store — add a vaccination record (Owner)
    // =========================================================================

    public function store(Request $request, $petId)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized');
            }

            $validator = Validator::make($request->all(), [
                'vaccine_name'      => 'required|string|max:255',
                'date_administered' => 'nullable|date|before_or_equal:today',
                'next_due_date'     => 'nullable|date|after_or_equal:date_administered',
                'notes'             => 'nullable|string|max:1000',
            ], [
                'next_due_date.after_or_equal' => 'Next due date must be after or on the date administered.',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $vaccination = Vaccination::create([
                'pet_id'            => $pet->id,
                'vaccine_name'      => $request->vaccine_name,
                'date_administered' => $request->date_administered,
                'next_due_date'     => $request->next_due_date,
                'notes'             => $request->notes,
            ]);

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $vaccination, 'message' => 'Vaccination record added!'], 201)
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Vaccination record added!');

        } catch (\Exception $e) {
            Log::error('Error storing vaccination: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to add vaccination record'], 500)
                : back()->with('error', 'Failed to add vaccination record')->withInput();
        }
    }

    // =========================================================================
    // show — single vaccination record (Owner)
    // =========================================================================

    public function show(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

            $vaccination = Vaccination::where('pet_id', $pet->id)->findOrFail($id);
            
            $vaccination->formatted_date_administered = $vaccination->getFormattedDateAdministered();
            $vaccination->formatted_next_due_date = $vaccination->getFormattedNextDueDate();

            return response()->json(['success' => true, 'data' => $vaccination]);

        } catch (\Exception $e) {
            Log::error('Error fetching vaccination: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Vaccination record not found'], 404);
        }
    }

    // =========================================================================
    // update — edit a vaccination record (Owner)
    // =========================================================================

    public function update(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized');
            }

            $vaccination = Vaccination::where('pet_id', $pet->id)->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'vaccine_name'      => 'required|string|max:255',
                'date_administered' => 'nullable|date|before_or_equal:today',
                'next_due_date'     => 'nullable|date|after_or_equal:date_administered',
                'notes'             => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $vaccination->update($validator->validated());

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $vaccination->fresh(), 'message' => 'Vaccination updated successfully'])
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Vaccination updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating vaccination: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to update vaccination'], 500)
                : back()->with('error', 'Failed to update vaccination')->withInput();
        }
    }

    // =========================================================================
    // destroy — delete a vaccination record (Owner)
    // =========================================================================

    public function destroy(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

            $vaccination = Vaccination::where('pet_id', $pet->id)->findOrFail($id);
            $vaccination->delete();

            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => 'Vaccination record deleted'])
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Vaccination record deleted');

        } catch (\Exception $e) {
            Log::error('Error deleting vaccination: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to delete vaccination'], 500)
                : back()->with('error', 'Failed to delete vaccination');
        }
    }

    // =========================================================================
    // CLINIC METHODS
    // =========================================================================

    // =========================================================================
    // indexForClinic — list vaccinations for clinic view (all pets or filter by pet)
    // =========================================================================

    public function indexForClinic(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return $request->expectsJson() 
                    ? response()->json(['success' => false, 'message' => 'Unauthenticated'], 401)
                    : redirect()->route('clinic.login');
            }

            $query = Vaccination::with(['pet', 'pet.owner']);

            // Filter by specific pet if provided
            if ($petId = $request->input('pet_id')) {
                $query->where('pet_id', $petId);
            }

            // Filter by due soon
            if ($request->boolean('due_soon')) {
                $query->dueSoon($request->input('days', 30));
            }

            // Filter by overdue
            if ($request->boolean('overdue')) {
                $query->overdue();
            }

            // Search filter
            if ($search = $request->input('search')) {
                $query->search($search);
            }

            // Order by next due date (soonest first)
            $query->orderBy('next_due_date');

            $vaccinations = $query->get();

            // Add formatted dates
            $vaccinations->each(function ($v) {
                $v->formatted_date_administered = $v->getFormattedDateAdministered();
                $v->formatted_next_due_date = $v->getFormattedNextDueDate();
            });

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $vaccinations]);
            }

            return Inertia::render('Clinic/Vaccinations/Index', [
                'vaccinations' => $vaccinations,
                'filters' => $request->only(['pet_id', 'due_soon', 'overdue', 'search', 'days']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching vaccinations for clinic: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve vaccinations'], 500)
                : back()->with('error', 'Failed to retrieve vaccinations');
        }
    }

    // =========================================================================
    // showForClinic — view a specific vaccination (for clinic)
    // =========================================================================

    public function showForClinic(Request $request, $id)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return $request->expectsJson() 
                    ? response()->json(['success' => false, 'message' => 'Unauthenticated'], 401)
                    : redirect()->route('clinic.login');
            }

            $vaccination = Vaccination::with(['pet', 'pet.owner'])->findOrFail($id);
            
            $vaccination->formatted_date_administered = $vaccination->getFormattedDateAdministered();
            $vaccination->formatted_next_due_date = $vaccination->getFormattedNextDueDate();

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $vaccination]);
            }

            return Inertia::render('Clinic/Vaccinations/Show', ['vaccination' => $vaccination]);

        } catch (\Exception $e) {
            Log::error('Error fetching vaccination for clinic: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Vaccination not found'], 404)
                : back()->with('error', 'Vaccination not found');
        }
    }
}