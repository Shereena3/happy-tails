import { BaseService } from './BaseService';
import { ApiResponse, ListParams, NotificationType } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the notifications table */
export interface Notification {
    id: number;
    pet_owner_id: number;
    reminder_id?: number;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    read_at?: string;
    created_at: string;
    updated_at: string;
    // Eager-loaded relation
    reminder?: {
        id: number;
        title: string;
        type: string;
        remind_at: string;
        pet?: {
            id: number;
            name: string;
            photo_url?: string;
        };
    };
    // Server-computed
    type_label?: string;
    type_color?: string;
}

export interface NotificationListParams extends ListParams {
    type?: NotificationType;
    is_read?: boolean;
    filter?: 'recent';
}

export interface UnreadCountResponse {
    count: number;
    items: Array<{
        id: number;
        title: string;
        message: string;
        type: NotificationType;
        created_at: string;
        reminder_id?: number;
    }>;
}

// ─── Service class ────────────────────────────────────────────────────────────

class NotificationService extends BaseService {

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /** GET /api/owner/notifications */
    async getNotifications(
        params: NotificationListParams = {}
    ): Promise<ApiResponse<Notification[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Notification[]>(
            `${this.baseURL}/api/owner/notifications?${qs}`
        );
    }

    /**
     * GET /api/owner/notifications/{id}
     * Also auto-marks the notification as read on the server.
     */
    async getNotification(id: number): Promise<ApiResponse<Notification>> {
        return this.request<Notification>(
            `${this.baseURL}/api/owner/notifications/${id}`
        );
    }

    /** DELETE /api/owner/notifications/{id} */
    async deleteNotification(id: number): Promise<ApiResponse<null>> {
        return this.request<null>(
            `${this.baseURL}/api/owner/notifications/${id}`,
            { method: 'DELETE' }
        );
    }

    // ── Read / Unread ─────────────────────────────────────────────────────────

    /** POST /api/owner/notifications/{id}/mark-read */
    async markAsRead(id: number): Promise<ApiResponse<Notification>> {
        return this.request<Notification>(
            `${this.baseURL}/api/owner/notifications/${id}/mark-read`,
            { method: 'POST' }
        );
    }

    /** POST /api/owner/notifications/mark-all-read */
    async markAllAsRead(): Promise<ApiResponse<{ marked_count: number }>> {
        return this.request<{ marked_count: number }>(
            `${this.baseURL}/api/owner/notifications/mark-all-read`,
            { method: 'POST' }
        );
    }

    /**
     * GET /api/owner/notifications/unread-count
     * Lightweight endpoint for the header badge — returns count + latest 5 items.
     */
    async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
        return this.request<UnreadCountResponse>(
            `${this.baseURL}/api/owner/notifications/unread-count`
        );
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    async getUnread(params: Omit<NotificationListParams, 'is_read'> = {}): Promise<ApiResponse<Notification[]>> {
        return this.getNotifications({ ...params, is_read: false });
    }

    async getRecent(): Promise<ApiResponse<Notification[]>> {
        return this.getNotifications({ filter: 'recent' });
    }

    async getByType(type: NotificationType): Promise<ApiResponse<Notification[]>> {
        return this.getNotifications({ type });
    }
}

export const notificationService = new NotificationService();
