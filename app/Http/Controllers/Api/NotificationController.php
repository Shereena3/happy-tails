<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    private function ownerId(Request $request)
    {
        return $request->user('pet_owner')->id ?? $request->user()->id ?? null;
    }

    public function index(Request $request)
    {
        $ownerId = $this->ownerId($request);

        if (!$ownerId) {
            return response()->json([
                'success' => false,
                'message' => 'Pet owner not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => Notification::byOwner($ownerId)
                ->latest()
                ->get(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        $ownerId = $this->ownerId($request);

        return response()->json([
            'success' => true,
            'count' => Notification::byOwner($ownerId)->unread()->count(),
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $ownerId = $this->ownerId($request);

        Notification::markAllAsReadFor($ownerId);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => Notification::findOrFail($id),
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    public function destroy($id)
    {
        Notification::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted.',
        ]);
    }
}