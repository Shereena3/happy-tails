<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Pet;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReminderController extends Controller
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
    // OWNER METHODS
    // =========================================================================

    // =========================================================================
    // index — all reminders across all pets for the owner
    //          OR scoped to a single pet via ?pet_id=
    // =========================================================================

    public function index(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            // All pet IDs belonging to this owner
            $petIds = $owner->pets()->pluck('id')->toArray();

            $query = Reminder::whereIn('pet_id', $petIds)->with('pet');

            if ($petId = $request->input('pet_id')) {
                $query->forPet($petId);
            }

            if ($type = $request->input('type')) {
                $query->byType($type);
            }

            $filter = $request->input('filter');
            match ($filter) {
                'upcoming' => $query->upcoming(),
                'overdue'  => $query->overdue(),
                'due_soon' => $query->dueSoon(),
                'done'     => $query->done(),
                'pending'  => $query->pending(),
                default    => $query->orderBy('remind_at'),
            };

            $reminders = $query->get();

            // Add formatted dates
            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $reminders]);
            }

            return Inertia::render('Owner/Reminders/Index', [
                'reminders' => $reminders,
                'pets'      => $owner->pets()->active()->get(['id', 'name']),
                'types'     => Reminder::getTypes(),
                'filters'   => $request->only(['pet_id', 'type', 'filter']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reminders: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve reminders'], 500)
                : back()->with('error', 'Failed to retrieve reminders');
        }
    }

    // =========================================================================
    // store — create a reminder for a pet (Owner)
    // =========================================================================

    public function store(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $validator = Validator::make($request->all(), [
                'pet_id'    => 'required|integer|exists:pets,id',
                'type'      => ['required', Rule::in(Reminder::getTypes())],
                'title'     => 'required|string|max:255',
                'notes'     => 'nullable|string|max:1000',
                'remind_at' => 'required|date',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            // Ensure the pet belongs to the owner
            $pet = Pet::findOrFail($request->pet_id);
            if ($pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized');
            }

            $reminder = Reminder::create([
                'pet_id'    => $pet->id,
                'type'      => $request->type,
                'title'     => $request->title,
                'notes'     => $request->notes,
                'remind_at' => $request->remind_at,
                'is_done'   => false,
            ]);

            // Create a notification immediately so it appears in the bell
            Notification::notifyReminderDue($reminder->load('pet'));

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $reminder->load('pet'), 'message' => 'Reminder set!'], 201)
                : redirect()->route('owner.reminders.index')->with('success', 'Reminder set!');

        } catch (\Exception $e) {
            Log::error('Error storing reminder: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to set reminder'], 500)
                : back()->with('error', 'Failed to set reminder')->withInput();
        }
    }

    // =========================================================================
    // show — single reminder (Owner)
    // =========================================================================

    public function show(Request $request, $id)
    {
        try {
            $owner    = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $reminder = Reminder::with('pet')->findOrFail($id);

            if ($reminder->pet->pet_owner_id !== $owner->id) {
                return $this->unauthorized();
            }

            $reminder->formatted_remind_at = $reminder->getFormattedRemindAt();

            return response()->json(['success' => true, 'data' => $reminder]);

        } catch (\Exception $e) {
            Log::error('Error fetching reminder: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Reminder not found'], 404);
        }
    }

    // =========================================================================
    // update — edit a reminder (Owner)
    // =========================================================================

    public function update(Request $request, $id)
    {
        try {
            $owner    = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $reminder = Reminder::with('pet')->findOrFail($id);

            if ($reminder->pet->pet_owner_id !== $owner->id) {
                return $request->expectsJson() ? $this->unauthorized() : back()->with('error', 'Unauthorized');
            }

            $validator = Validator::make($request->all(), [
                'type'      => ['required', Rule::in(Reminder::getTypes())],
                'title'     => 'required|string|max:255',
                'notes'     => 'nullable|string|max:1000',
                'remind_at' => 'required|date',
                'is_done'   => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422)
                    : back()->withErrors($validator)->withInput();
            }

            $reminder->update($validator->validated());

            return $request->expectsJson()
                ? response()->json(['success' => true, 'data' => $reminder->fresh(), 'message' => 'Reminder updated'])
                : redirect()->route('owner.reminders.index')->with('success', 'Reminder updated');

        } catch (\Exception $e) {
            Log::error('Error updating reminder: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to update reminder'], 500)
                : back()->with('error', 'Failed to update reminder')->withInput();
        }
    }

    // =========================================================================
    // markDone — toggle reminder as done (Owner)
    // =========================================================================

    public function markDone(Request $request, $id)
    {
        try {
            $owner    = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $reminder = Reminder::with('pet')->findOrFail($id);

            if ($reminder->pet->pet_owner_id !== $owner->id) {
                return $this->unauthorized();
            }

            $reminder->markAsDone();

            return response()->json([
                'success' => true,
                'data'    => $reminder->fresh(),
                'message' => 'Reminder marked as done!',
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking reminder done: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update reminder'], 500);
        }
    }

    // =========================================================================
    // destroy — delete a reminder (Owner)
    // =========================================================================

    public function destroy(Request $request, $id)
    {
        try {
            $owner    = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $reminder = Reminder::with('pet')->findOrFail($id);

            if ($reminder->pet->pet_owner_id !== $owner->id) {
                return $this->unauthorized();
            }

            $reminder->delete();

            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => 'Reminder deleted'])
                : redirect()->route('owner.reminders.index')->with('success', 'Reminder deleted');

        } catch (\Exception $e) {
            Log::error('Error deleting reminder: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to delete reminder'], 500)
                : back()->with('error', 'Failed to delete reminder');
        }
    }

    // =========================================================================
    // CLINIC METHODS
    // =========================================================================

    // =========================================================================
    // indexForClinic — list all reminders for clinic view (all pets or filter by pet)
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

            $query = Reminder::with(['pet', 'pet.owner']);

            // Filter by specific pet if provided
            if ($petId = $request->input('pet_id')) {
                $query->where('pet_id', $petId);
            }

            // Filter by type
            if ($type = $request->input('type')) {
                $query->byType($type);
            }

            // Filter by status
            $filter = $request->input('filter');
            match ($filter) {
                'upcoming' => $query->upcoming(),
                'overdue'  => $query->overdue(),
                'due_soon' => $query->dueSoon($request->input('days', 7)),
                'done'     => $query->done(),
                'pending'  => $query->pending(),
                default    => $query->orderBy('remind_at'),
            };

            // Search by title or notes
            if ($search = $request->input('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('notes', 'like', "%{$search}%");
                });
            }

            $reminders = $query->get();

            // Add formatted dates
            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $reminders]);
            }

            return Inertia::render('Clinic/Reminders/Index', [
                'reminders' => $reminders,
                'types'     => Reminder::getTypes(),
                'filters'   => $request->only(['pet_id', 'type', 'filter', 'search', 'days']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reminders for clinic: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve reminders'], 500)
                : back()->with('error', 'Failed to retrieve reminders');
        }
    }

    // =========================================================================
    // showForClinic — view a specific reminder (for clinic)
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

            $reminder = Reminder::with(['pet', 'pet.owner'])->findOrFail($id);
            
            $reminder->formatted_remind_at = $reminder->getFormattedRemindAt();

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $reminder]);
            }

            return Inertia::render('Clinic/Reminders/Show', ['reminder' => $reminder]);

        } catch (\Exception $e) {
            Log::error('Error fetching reminder for clinic: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Reminder not found'], 404)
                : back()->with('error', 'Reminder not found');
        }
    }

    // =========================================================================
    // markDoneForClinic — mark a reminder as done (for clinic)
    // =========================================================================

    public function markDoneForClinic(Request $request, $id)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return $this->unauthenticated();
            }

            $reminder = Reminder::with('pet')->findOrFail($id);
            $reminder->markAsDone();

            return response()->json([
                'success' => true,
                'data'    => $reminder->fresh(),
                'message' => 'Reminder marked as done!',
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking reminder done for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update reminder'], 500);
        }
    }

    // =========================================================================
    // getOverdueForClinic — Get overdue reminders for clinic dashboard
    // =========================================================================

    public function getOverdueForClinic(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $reminders = Reminder::with(['pet', 'pet.owner'])
                ->overdue()
                ->orderBy('remind_at')
                ->limit(20)
                ->get();

            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            return response()->json(['success' => true, 'data' => $reminders]);

        } catch (\Exception $e) {
            Log::error('Error fetching overdue reminders for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch reminders'], 500);
        }
    }

    // =========================================================================
    // getPendingForClinic — Get pending reminders for clinic dashboard
    // =========================================================================

    public function getPendingForClinic(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $reminders = Reminder::with(['pet', 'pet.owner'])
                ->pending()
                ->orderBy('remind_at')
                ->limit(20)
                ->get();

            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            return response()->json(['success' => true, 'data' => $reminders]);

        } catch (\Exception $e) {
            Log::error('Error fetching pending reminders for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch reminders'], 500);
        }
    }

    // =========================================================================
    // getUpcomingForClinic — Get upcoming reminders for clinic
    // =========================================================================

    public function getUpcomingForClinic(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $reminders = Reminder::with(['pet', 'pet.owner'])
                ->upcoming()
                ->limit(20)
                ->get();

            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            return response()->json(['success' => true, 'data' => $reminders]);

        } catch (\Exception $e) {
            Log::error('Error fetching upcoming reminders for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch reminders'], 500);
        }
    }

    // =========================================================================
    // getDueSoonForClinic — Get due soon reminders for clinic
    // =========================================================================

    public function getDueSoonForClinic(Request $request)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $days = $request->input('days', 7);
            $reminders = Reminder::with(['pet', 'pet.owner'])
                ->dueSoon($days)
                ->limit(20)
                ->get();

            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            return response()->json(['success' => true, 'data' => $reminders]);

        } catch (\Exception $e) {
            Log::error('Error fetching due soon reminders for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch reminders'], 500);
        }
    }

    // =========================================================================
    // getByTypeForClinic — Get reminders by type for clinic
    // =========================================================================

    public function getByTypeForClinic(Request $request, $type)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            // Validate type
            if (!in_array($type, Reminder::getTypes())) {
                return response()->json(['success' => false, 'message' => 'Invalid reminder type'], 422);
            }

            $reminders = Reminder::with(['pet', 'pet.owner'])
                ->byType($type)
                ->orderBy('remind_at')
                ->limit(50)
                ->get();

            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            return response()->json(['success' => true, 'data' => $reminders]);

        } catch (\Exception $e) {
            Log::error('Error fetching reminders by type for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch reminders'], 500);
        }
    }

    // =========================================================================
    // getPetRemindersForClinic — Get reminders for a specific pet (clinic)
    // =========================================================================

    public function getPetRemindersForClinic(Request $request, $petId)
    {
        try {
            $clinic = $this->getClinic($request);
            if (!$clinic) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $pet = Pet::findOrFail($petId);

            $query = Reminder::with('pet')
                ->forPet($pet->id);

            $filter = $request->input('filter');
            match ($filter) {
                'upcoming' => $query->upcoming(),
                'overdue'  => $query->overdue(),
                'due_soon' => $query->dueSoon($request->input('days', 7)),
                'done'     => $query->done(),
                'pending'  => $query->pending(),
                default    => $query->orderBy('remind_at'),
            };

            $reminders = $query->get();

            $reminders->each(function ($r) {
                $r->formatted_remind_at = $r->getFormattedRemindAt();
            });

            return response()->json(['success' => true, 'data' => $reminders]);

        } catch (\Exception $e) {
            Log::error('Error fetching pet reminders for clinic: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch reminders'], 500);
        }
    }
}