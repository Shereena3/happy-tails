<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class MedicineController extends Controller
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

    // =========================================================================
    // index — list all medicines for a pet
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

            $query = Medicine::forPet($pet->id);

            if ($search = $request->input('search')) {
                $query->search($search);
            }

            $filter = $request->input('filter');
            match ($filter) {
                'ongoing'   => $query->ongoing(),
                'completed' => $query->completed(),
                default     => null,
            };

            $medicines = $query->orderByDesc('start_date')->get();

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $medicines]);
            }

            return Inertia::render('Owner/Medicines/Index', [
                'pet'       => $pet->append(['photo_url']),
                'medicines' => $medicines,
                'filters'   => $request->only(['search', 'filter']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching medicines: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve medicines'], 500)
                : back()->with('error', 'Failed to retrieve medicines');
        }
    }

    // =========================================================================
    // store — add a medicine record
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
                'medicine_name' => 'required|string|max:255',
                'dosage'        => 'nullable|string|max:100',
                'start_date'    => 'nullable|date',
                'end_date'      => 'nullable|date|after_or_equal:start_date',
                'notes'         => 'nullable|string|max:1000',
            ], [
                'end_date.after_or_equal' => 'End date must be after or on the start date.',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $medicine = Medicine::create([
                'pet_id'        => $pet->id,
                'medicine_name' => $request->medicine_name,
                'dosage'        => $request->dosage,
                'start_date'    => $request->start_date,
                'end_date'      => $request->end_date,
                'notes'         => $request->notes,
            ]);

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $medicine, 'message' => 'Medicine record added!'], 201)
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Medicine record added!');

        } catch (\Exception $e) {
            Log::error('Error storing medicine: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to add medicine record'], 500)
                : back()->with('error', 'Failed to add medicine record')->withInput();
        }
    }

    // =========================================================================
    // show — single medicine record
    // =========================================================================

    public function show(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

            $medicine = Medicine::where('pet_id', $pet->id)->findOrFail($id);

            return response()->json(['success' => true, 'data' => $medicine]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Medicine record not found'], 404);
        }
    }

    // =========================================================================
    // update — edit a medicine record
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

            $medicine  = Medicine::where('pet_id', $pet->id)->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'medicine_name' => 'required|string|max:255',
                'dosage'        => 'nullable|string|max:100',
                'start_date'    => 'nullable|date',
                'end_date'      => 'nullable|date|after_or_equal:start_date',
                'notes'         => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $medicine->update($validator->validated());

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $medicine->fresh(), 'message' => 'Medicine updated successfully'])
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Medicine updated successfully');

        } catch (\Exception $e) {
            Log::error('Error updating medicine: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to update medicine'], 500)
                : back()->with('error', 'Failed to update medicine')->withInput();
        }
    }

    // =========================================================================
    // destroy — delete a medicine record
    // =========================================================================

    public function destroy(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

            $medicine = Medicine::where('pet_id', $pet->id)->findOrFail($id);
            $medicine->delete();

            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => 'Medicine record deleted'])
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Medicine record deleted');

        } catch (\Exception $e) {
            Log::error('Error deleting medicine: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to delete medicine'], 500)
                : back()->with('error', 'Failed to delete medicine');
        }
    }
}
