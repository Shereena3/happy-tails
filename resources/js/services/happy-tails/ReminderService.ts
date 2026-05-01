import { BaseService } from './BaseService';
import { ApiResponse, ListParams } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Reminder {
    id: number;
    pet_id: number;
    type: 'vaccination' | 'medicine' | 'grooming' | 'vet_visit' | 'other';
    title: string;
    notes?: string;
    remind_at: string;      // datetime string
    is_done: boolean;
    created_at: string;
    updated_at: string;
    // Optional relations (when loaded with ->with())
    pet?: {
        id: number;
        name: string;
        species: string;
        breed?: string;
        photo_url?: string;
        owner?: {
            id: number;
            name?: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            phone_number?: string;
        };
    };
    // Formatted dates (appended by server)
    formatted_remind_at?: string;
}

export interface ReminderStoreData {
    pet_id: number;
    type: string;
    title: string;
    notes?: string;
    remind_at: string;
}

export interface ReminderUpdateData {
    type?: string;
    title?: string;
    notes?: string;
    remind_at?: string;
    is_done?: boolean;
}

export interface ReminderListParams extends ListParams {
    pet_id?: number;
    type?: string;
    filter?: 'upcoming' | 'overdue' | 'due_soon' | 'done' | 'pending';
    days?: number;      // for due_soon filter
    search?: string;
}

// ─── Service class ────────────────────────────────────────────────────────────

class ReminderService extends BaseService {

    // =========================================================================
    // OWNER METHODS
    // =========================================================================

    /**
     * GET /api/owner/reminders
     * Lists reminders for the authenticated owner's pets
     */
    async getReminders(params: ReminderListParams = {}): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/owner/reminders?${qs}`);
    }

    /**
     * GET /api/owner/reminders/{id}
     * Get a single reminder by ID
     */
    async getReminder(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders/${id}`);
    }

    /**
     * POST /api/owner/reminders
     * Create a new reminder
     */
    async createReminder(data: ReminderStoreData): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT /api/owner/reminders/{id}
     * Update an existing reminder
     */
    async updateReminder(id: number, data: ReminderUpdateData): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * POST /api/owner/reminders/{id}/done
     * Mark a reminder as done
     */
    async markAsDone(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/owner/reminders/${id}/done`, {
            method: 'POST',
        });
    }

    /**
     * DELETE /api/owner/reminders/{id}
     * Delete a reminder
     */
    async deleteReminder(id: number): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/api/owner/reminders/${id}`, {
            method: 'DELETE',
        });
    }

    // =========================================================================
    // CLINIC METHODS
    // =========================================================================

    /**
     * GET /api/clinic/reminders
     * Lists all reminders across all pets (clinic view)
     */
    async getRemindersForClinic(params: ReminderListParams = {}): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders?${qs}`);
    }

    /**
     * GET /api/clinic/reminders/{id}
     * Get a single reminder by ID (clinic view)
     */
    async getReminderForClinic(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/clinic/reminders/${id}`);
    }

    /**
     * GET /api/clinic/reminders/overdue
     * Get overdue reminders for clinic dashboard
     */
    async getOverdueForClinic(limit: number = 20): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString({ limit });
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/overdue?${qs}`);
    }

    /**
     * GET /api/clinic/reminders/pending
     * Get pending reminders for clinic dashboard
     */
    async getPendingForClinic(limit: number = 20): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString({ limit });
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/pending?${qs}`);
    }

    /**
     * GET /api/clinic/reminders/upcoming
     * Get upcoming reminders for clinic
     */
    async getUpcomingForClinic(limit: number = 20): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString({ limit });
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/upcoming?${qs}`);
    }

    /**
     * GET /api/clinic/reminders/due-soon
     * Get due soon reminders for clinic
     * @param days Number of days to look ahead (default: 7)
     */
    async getDueSoonForClinic(days: number = 7, limit: number = 20): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString({ days, limit });
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/due-soon?${qs}`);
    }

    /**
     * GET /api/clinic/reminders/type/{type}
     * Get reminders by type for clinic
     * @param type Reminder type (vaccination, medicine, grooming, vet_visit, other)
     */
    async getByTypeForClinic(type: string, limit: number = 50): Promise<ApiResponse<Reminder[]>> {
        const qs = this.buildQueryString({ limit });
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/reminders/type/${type}?${qs}`);
    }

    /**
     * GET /api/clinic/pets/{petId}/reminders
     * Get reminders for a specific pet (clinic view)
     */
    async getPetRemindersForClinic(petId: number, filter?: string, days?: number): Promise<ApiResponse<Reminder[]>> {
        const params: Record<string, any> = {};
        if (filter) params.filter = filter;
        if (days) params.days = days;
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/clinic/pets/${petId}/reminders?${qs}`);
    }

    /**
     * POST /api/clinic/reminders/{id}/done
     * Mark a reminder as done (clinic)
     */
    async markAsDoneForClinic(id: number): Promise<ApiResponse<Reminder>> {
        return this.request<Reminder>(`${this.baseURL}/api/clinic/reminders/${id}/done`, {
            method: 'POST',
        });
    }

    // =========================================================================
    // CONVENIENCE METHODS
    // =========================================================================

    /**
     * Get reminders that are due today
     */
    async getDueToday(): Promise<ApiResponse<Reminder[]>> {
        const today = new Date().toISOString().split('T')[0];
        const params = { remind_at: today };
        const qs = this.buildQueryString(params);
        return this.request<Reminder[]>(`${this.baseURL}/api/owner/reminders?${qs}`);
    }

    /**
     * Get upcoming reminders for the next N days
     */
    async getUpcomingDays(days: number = 7): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ filter: 'due_soon', days });
    }

    /**
     * Get all overdue reminders
     */
    async getOverdue(): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ filter: 'overdue' });
    }

    /**
     * Get all pending reminders
     */
    async getPending(): Promise<ApiResponse<Reminder[]>> {
        return this.getReminders({ filter: 'pending' });
    }
}

export const reminderService = new ReminderService();