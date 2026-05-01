<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private function unauthenticated(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['success' => false, 'message' => 'Unauthenticated. Please log in.'], 401);
    }

    private function getOwner(Request $request): ?\App\Models\PetOwner
    {
        return $request->user('pet_owner');
    }

    // =========================================================================
    // index — list notifications for the authenticated owner
    // =========================================================================

    public function index(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $query = Notification::byOwner($owner->id)->with('reminder.pet');

            if ($type = $request->input('type')) {
                $query->byType($type);
            }

            if ($request->has('is_read')) {
                $request->boolean('is_read') ? $query->read() : $query->unread();
            }

            if ($request->input('filter') === 'recent') {
                $query->recent(7);
            }

            $query->orderByDesc('created_at');

            $perPage       = $request->input('per_page', 15);
            $notifications = $query->paginate($perPage);

            if ($request->expectsJson()) {
                return response()->json([
                    'success'    => true,
                    'data'       => $notifications->items(),
                    'pagination' => [
                        'current_page' => $notifications->currentPage(),
                        'last_page'    => $notifications->lastPage(),
                        'per_page'     => $notifications->perPage(),
                        'total'        => $notifications->total(),
                    ],
                ]);
            }

            return Inertia::render('Owner/Notifications/Index', [
                'notifications' => $notifications,
                'filters'       => $request->only(['type', 'is_read', 'filter']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to retrieve notifications'], 500)
                : back()->with('error', 'Failed to retrieve notifications');
        }
    }

    // =========================================================================
    // show — view a single notification (auto-marks as read)
    // =========================================================================

    public function show(Request $request, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) {
                return $request->expectsJson() ? $this->unauthenticated() : redirect()->route('owner.login');
            }

            $notification = Notification::with('reminder.pet')->findOrFail($id);

            if ($notification->pet_owner_id !== $owner->id) {
                return $request->expectsJson()
                    ? response()->json(['success' => false, 'message' => 'Unauthorized access'], 403)
                    : back()->with('error', 'Unauthorized access');
            }

            if (!$notification->isRead()) {
                $notification->markAsRead();
            }

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'data' => $notification->fresh()]);
            }

            return Inertia::render('Owner/Notifications/Show', [
                'notification' => $notification->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching notification: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Notification not found'], 404)
                : back()->with('error', 'Notification not found');
        }
    }

    // =========================================================================
    // markAsRead — mark a single notification as read
    // =========================================================================

    public function markAsRead(Request $request, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $notification = Notification::findOrFail($id);

            if ($notification->pet_owner_id !== $owner->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'data'    => $notification->fresh(),
                'message' => 'Notification marked as read',
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking notification as read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to mark as read'], 500);
        }
    }

    // =========================================================================
    // markAllAsRead — bulk mark all notifications as read
    // =========================================================================

    public function markAllAsRead(Request $request)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $count = Notification::markAllAsReadFor($owner->id);

            return response()->json([
                'success' => true,
                'data'    => ['marked_count' => $count],
                'message' => "{$count} notification(s) marked as read",
            ]);

        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to mark notifications as read'], 500);
        }
    }

    // =========================================================================
    // unreadCount — lightweight polling endpoint for header badge
    // =========================================================================

    public function unreadCount(Request $request): \Illuminate\Http\JsonResponse
    {
        $owner = $this->getOwner($request);
        if (!$owner) return response()->json(['success' => false, 'count' => 0], 401);

        $query  = Notification::byOwner($owner->id)->unread();
        $count  = $query->count();
        $latest = $query->latest('created_at')
            ->take(5)
            ->get(['id', 'title', 'message', 'type', 'created_at', 'reminder_id']);

        return response()->json([
            'success' => true,
            'count'   => $count,
            'items'   => $latest,
        ]);
    }

    // =========================================================================
    // destroy — delete a notification
    // =========================================================================

    public function destroy(Request $request, $id)
    {
        try {
            $owner = $this->getOwner($request);
            if (!$owner) return $this->unauthenticated();

            $notification = Notification::findOrFail($id);

            if ($notification->pet_owner_id !== $owner->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            $notification->delete();

            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => 'Notification deleted'])
                : redirect()->route('owner.notifications.index')->with('success', 'Notification deleted');

        } catch (\Exception $e) {
            Log::error('Error deleting notification: ' . $e->getMessage());
            return $request->expectsJson()
                ? response()->json(['success' => false, 'message' => 'Failed to delete notification'], 500)
                : back()->with('error', 'Failed to delete notification');
        }
    }
}
