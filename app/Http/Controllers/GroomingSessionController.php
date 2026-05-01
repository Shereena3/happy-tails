<?php

namespace App\Http\Controllers;

use App\Models\GroomingSession;
use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GroomingSessionController extends Controller
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
    // index — list all grooming sessions for a pet
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

            $query = GroomingSession::forPet($pet->id);

            if ($search = $request->input('search')) {
                $query->search($search);
            }

            $filter = $request->input('filter');
            match ($filter) {
                'upcoming' => $query->upcoming(),
                'past'     => $query->past(),
                default    => $query->orderByDesc('date'),
            };

            $sessions = $query->get();

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $sessions]);
            }

            return Inertia::render('Owner/Grooming/Index', [
                'pet'      => $pet->append(['photo_url']),
                'sessions' => $sessions,
                'filters'  => $request->only(['search', 'filter']),
                'service_types' => GroomingSession::getServiceTypes(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching grooming sessions: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve grooming sessions'], 500)
                : back()->with('error', 'Failed to retrieve grooming sessions');
        }
    }

    // =========================================================================
    // store — log a grooming session
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
                'date'         => 'required|date',
                'service_type' => ['nullable', Rule::in(GroomingSession::getServiceTypes())],
                'notes'        => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $session = GroomingSession::create([
                'pet_id'       => $pet->id,
                'date'         => $request->date,
                'service_type' => $request->service_type,
                'notes'        => $request->notes,
            ]);

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $session, 'message' => 'Grooming session logged!'], 201)
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Grooming session logged!');

        } catch (\Exception $e) {
            Log::error('Error storing grooming session: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to log grooming session'], 500)
                : back()->with('error', 'Failed to log grooming session')->withInput();
        }
    }

    // =========================================================================
    // show — single grooming session
    // =========================================================================

    public function show(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

            $session = GroomingSession::where('pet_id', $pet->id)->findOrFail($id);

            return response()->json(['success' => true, 'data' => $session]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Grooming session not found'], 404);
        }
    }

    // =========================================================================
    // update — edit a grooming session
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

            $session   = GroomingSession::where('pet_id', $pet->id)->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'date'         => 'required|date',
                'service_type' => ['nullable', Rule::in(GroomingSession::getServiceTypes())],
                'notes'        => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $session->update($validator->validated());

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $session->fresh(), 'message' => 'Grooming session updated'])
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Grooming session updated');

        } catch (\Exception $e) {
            Log::error('Error updating grooming session: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to update grooming session'], 500)
                : back()->with('error', 'Failed to update grooming session')->withInput();
        }
    }

    // =========================================================================
    // destroy — delete a grooming session
    // =========================================================================

    public function destroy(Request $request, $petId, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $pet = Pet::findOrFail($petId);
            if ($pet->pet_owner_id !== $owner->id) return $this->unauthorized();

            $session = GroomingSession::where('pet_id', $pet->id)->findOrFail($id);
            $session->delete();

            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => 'Grooming session deleted'])
                : redirect()->route('owner.pets.show', $petId)->with('success', 'Grooming session deleted');

        } catch (\Exception $e) {
            Log::error('Error deleting grooming session: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to delete grooming session'], 500)
                : back()->with('error', 'Failed to delete grooming session');
        }
    }
}
