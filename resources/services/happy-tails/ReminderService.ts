import { BaseService } from './BaseService';
import { ApiResponse, ListParams, ReminderType } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the reminders table */
export interface Reminder {
    id: number;
    pet_id: number;
    type: ReminderType;
    title: string;
    notes?: string;
    remind_at: string;              // ISO datetime string
    is_done: boolean;
    created_at: string;
    updated_at: string;
    // Eager-loaded relation
    pet?: {
        id: number;
        name: string;
        species: string;
        photo_url?: string;
        owner?: {
            id: number;
            name?: string;
            first_name: string;
            last_name: string;
        };
    };
    // Server-computed
    type_label?: string;
    type_color?: string;
    formatted_remind_at?: string;
}

export interface ReminderFormData {
    pet_id: number;
    type: ReminderType;
    title: string;
    notes?: string;
    remind_at: string;              // ISO datetime string e.g. '2025-05-10 09:00:00'
}

export interface ReminderUpdateData {
    type?: ReminderType;
    title?: string;
    notes?: string;
    remind_at?: string;
    is_done?: boolean;
}

export interface ReminderListParams extends ListParams {
    pet_id?: number;                // filter by specific pet
    type?: ReminderType;
    filter?: 'upcoming' | 'overdue' | 'due_soon' | 'done' | 'pending';
}

// ─── Service class ────────────────────────────────────────────────────────────

class ReminderService extends BaseService {

    // =========================================================================
    // OWNER METHODS (auth:pet_owner)
    // =========================================================================

    /**
     * GET /api/owner/reminders
     * Returns reminders across all pets belonging to the authenticated owner.
     * Optionally filter by pet_id, type, or filter preset.
     */
    async getReminders(params: ReminderListParams = {}): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/owner/reminders?${qs}`);
    }

    /** GET /api/owner/reminders/{id} */
    async getReminder(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders/${id}`);
    }

    /**
     * POST /api/owner/reminders
     * Creates a reminder and fires a notification immediately.
     */
    async createReminder(data: ReminderFormData): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /** PUT /api/owner/reminders/{id} */
    async updateReminder(id: number, data: ReminderUpdateData): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * POST /api/owner/reminders/{id}/done
     * Marks the reminder as done without a full update.
     */
    async markDone(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(
            `${this.baseURL}/api/owner/reminders/${id}/done`,
            { method: 'POST' }
        );
    }

    /** DELETE /api/owner/reminders/{id} */
    async deleteReminder(id: number): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/api/owner/reminders/${id}`, {
            method: 'DELETE',
        });
    }

    // ── Owner convenience helpers ───────────────────────────────────────────

    async getUpcoming(petId?: number): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ pet_id: petId, filter: 'upcoming' });
    }

    async getOverdue(petId?: number): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ pet_id: petId, filter: 'overdue' });
    }

    async getDueSoon(petId?: number, days: number = 7): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ pet_id: petId, filter: 'due_soon' });
    }

    async getPending(petId?: number): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ pet_id: petId, filter: 'pending' });
    }

    async getDone(petId?: number): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ pet_id: petId, filter: 'done' });
    }

    async getByType(type: ReminderType, petId?: number): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ pet_id: petId, type });
    }

    async getPetReminders(petId: number, params: Omit<ReminderListParams, 'pet_id'> = {}): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ ...params, pet_id: petId });
    }

    // =========================================================================
    // CLINIC METHODS (auth:pet_clinic)
    // =========================================================================

    /**
     * GET /api/clinic/reminders
     * Returns all reminders across all pets (read-only for clinic).
     */
    async getRemindersForClinic(params: ReminderListParams = {}): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders?${qs}`);
    }

    /** GET /api/clinic/reminders/{id} */
    async getReminderForClinic(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/clinic/reminders/${id}`);
    }

    // ── Clinic dashboard convenience helpers ─────────────────────────────────

    /** GET /api/clinic/reminders/overdue */
    async getOverdueForClinic(): Promise<ApiResponse<Reminder[]>> {
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/overdue`);
    }

    /** GET /api/clinic/reminders/pending */
    async getPendingForClinic(): Promise<ApiResponse<Reminder[]>> {
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/pending`);
    }

    /** GET /api/clinic/reminders/upcoming */
    async getUpcomingForClinic(): Promise<ApiResponse<Reminder[]>> {
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/upcoming`);
    }

    /** GET /api/clinic/reminders/due-soon */
    async getDueSoonForClinic(days: number = 7): Promise<ApiResponse<Reminder[]>> {
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/due-soon?days=${days}`);
    }

    /** GET /api/clinic/reminders/type/{type} */
    async getByTypeForClinic(type: ReminderType): Promise<ApiResponse<Reminder[]>> {
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/type/${type}`);
    }

    /** GET /api/clinic/pets/{petId}/reminders */
    async getPetRemindersForClinic(petId: number, params: ReminderListParams = {}): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/pets/${petId}/reminders?${qs}`);
    }

    /**
     * POST /api/clinic/reminders/{id}/done
     * Marks a reminder as done (clinic can mark reminders as complete).
     */
    async markDoneForClinic(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(
            `${this.baseURL}/api/clinic/reminders/${id}/done`,
            { method: 'POST' }
        );
    }
}

export const reminderService = new ReminderService();