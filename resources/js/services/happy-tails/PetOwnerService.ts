import { BaseService } from './BaseService';
import { ApiResponse, ListParams, NameSuffix, OwnerDashboardStats } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the pet_owners table */
export interface PetOwner {
    id: number;
    last_name: string;
    first_name: string;
    middle_name?: string;
    suffix?: NameSuffix;
    name?: string;              // server-computed full name
    profile_photo_path?: string;
    profile_photo_url?: string; // server-appended public URL
    email: string;
    phone_number?: string;
    address?: string;
    is_active: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    // Present when fetched via profile()
    stats?: OwnerDashboardStats;
}

/**
 * Helper: build the display name from split fields.
 * Format: "Dela Cruz, Juan M. Jr."
 */
export function formatFullName(
    owner: Pick<PetOwner, 'last_name' | 'first_name' | 'middle_name' | 'suffix'>
): string {
    const mi = owner.middle_name ? owner.middle_name.charAt(0) + '.' : '';
    return [owner.last_name + ',', owner.first_name, mi, owner.suffix ?? '']
        .filter(Boolean)
        .join(' ')
        .trim();
}

/**
 * Helper: get 2-letter initials from split name fields.
 */
export function getInitials(owner: Partial<PetOwner>): string {
    if (owner.last_name && owner.first_name) {
        return (owner.last_name.charAt(0) + owner.first_name.charAt(0)).toUpperCase();
    }
    if (owner.name) {
        return owner.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return '?';
}

/** Fields for self-registration */
export interface PetOwnerRegisterData {
    last_name: string;
    first_name: string;
    middle_name?: string;
    suffix?: NameSuffix;
    email: string;
    phone_number?: string;
    address?: string;
    password: string;
    password_confirmation: string;
}

/** Fields allowed when updating a profile */
export interface PetOwnerUpdateData {
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    suffix?: NameSuffix;
    email?: string;
    phone_number?: string;
    address?: string;
    password?: string;
    password_confirmation?: string;
    profile_photo?: File | null;    // File to upload, null to remove
}

export interface PetOwnerListParams extends ListParams {
    is_active?: boolean;
}

/** Dashboard response shape */
export interface DashboardData {
    owner: PetOwner;
    stats: OwnerDashboardStats;
    pets: import('./PetService').Pet[];
    upcoming_reminders: import('./ReminderService').Reminder[];
    nearby_clinics: import('./PetClinicService').PetClinic[];
}

// ─── Service class ────────────────────────────────────────────────────────────

class PetOwnerService extends BaseService {

    // ── Internal helpers ──────────────────────────────────────────────────────

    private toFormData(
        data: PetOwnerUpdateData & { _method?: string }
    ): FormData {
        const fd = new FormData();
        if (data._method)             fd.append('_method', data._method);
        if (data.last_name   != null) fd.append('last_name', data.last_name);
        if (data.first_name  != null) fd.append('first_name', data.first_name);
        if (data.middle_name != null) fd.append('middle_name', data.middle_name);
        if (data.suffix      != null) fd.append('suffix', data.suffix);
        if (data.email       != null) fd.append('email', data.email);
        if (data.phone_number!= null) fd.append('phone_number', data.phone_number);
        if (data.address     != null) fd.append('address', data.address);
        if (data.password    != null) fd.append('password', data.password);
        if (data.password_confirmation != null) {
            fd.append('password_confirmation', data.password_confirmation);
        }
        if (data.profile_photo instanceof File) {
            fd.append('profile_photo', data.profile_photo);
        } else if (data.profile_photo === null) {
            fd.append('remove_profile_photo', '1');
        }
        return fd;
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    /** POST /owner/login */
    async login(data: { email: string; password: string; remember?: boolean }): Promise<ApiResponse<PetOwner>> {
        return this.request<PetOwner>(`${this.baseURL}/owner/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /** POST /owner/logout */
    async logout(): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/owner/logout`, { method: 'POST' });
    }

    /** POST /owner/register */
    async register(data: PetOwnerRegisterData): Promise<ApiResponse<PetOwner>> {
        return this.request<PetOwner>(`${this.baseURL}/owner/register`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    /**
     * GET /api/owner/dashboard?lat=&lng=
     * Returns owner info, stats, active pets, upcoming reminders,
     * and nearby clinics (if lat/lng provided).
     */
    async getDashboard(params: { lat?: number; lng?: number } = {}): Promise<ApiResponse<DashboardData>> {
        const qs = this.buildQueryString(params);
        return this.request<DashboardData>(`${this.baseURL}/api/owner/dashboard?${qs}`);
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    /** GET /api/owner/profile */
    async getProfile(): Promise<ApiResponse<PetOwner>> {
        return this.request<PetOwner>(`${this.baseURL}/api/owner/profile`);
    }

    /**
     * POST /api/owner/profile (_method=PUT for multipart)
     * Accepts profile_photo as File.
     */
    async updateProfile(data: PetOwnerUpdateData): Promise<ApiResponse<PetOwner>> {
        const fd = this.toFormData({ ...data, _method: 'PUT' });
        return this.request<PetOwner>(`${this.baseURL}/api/owner/profile`, {
            method: 'POST',
            body: fd,
        });
    }

    /**
     * DELETE /api/owner/account
     * Requires password confirmation. Cascades deletion of pets, reminders, notifications.
     */
    async deleteAccount(password: string): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/api/owner/account`, {
            method: 'DELETE',
            body: JSON.stringify({ password }),
        });
    }
}

export const petOwnerService = new PetOwnerService();
