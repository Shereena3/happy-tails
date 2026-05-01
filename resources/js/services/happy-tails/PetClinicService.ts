import { BaseService } from './BaseService';
import { ApiResponse, ListParams } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the pet_clinics table */
export interface PetClinic {
    id: number;
    clinic_name: string;
    profile_photo_path?: string;
    profile_photo_url?: string;     // server-appended public URL
    email: string;
    phone_number?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    // Present on nearby queries
    distance?: number;              // km, from Haversine scope
}

/** Fields allowed when updating the clinic's own profile */
export interface PetClinicUpdateData {
    clinic_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    password?: string;
    password_confirmation?: string;
    profile_photo?: File | null;    // File to upload, null to remove
}

/** Query params for browsing clinics (pet owner side) */
export interface ClinicListParams extends ListParams {
    lat?: number;       // owner's current latitude for nearby sort
    lng?: number;       // owner's current longitude for nearby sort
    radius?: number;    // km radius (default: 10)
}

/** Dashboard stats for clinic */
export interface ClinicDashboardStats {
    total_owners?: number;
    total_pets?: number;
    overdue_reminders?: number;
    pending_reminders?: number;
}

// ─── Service class ────────────────────────────────────────────────────────────

class PetClinicService extends BaseService {

    // ── Internal helpers ──────────────────────────────────────────────────────

    private toFormData(
        data: PetClinicUpdateData & { _method?: string }
    ): FormData {
        const fd = new FormData();
        if (data._method)             fd.append('_method', data._method);
        if (data.clinic_name != null) fd.append('clinic_name', data.clinic_name);
        if (data.email       != null) fd.append('email', data.email);
        if (data.phone_number!= null) fd.append('phone_number', data.phone_number);
        if (data.address     != null) fd.append('address', data.address);
        if (data.latitude    != null) fd.append('latitude', String(data.latitude));
        if (data.longitude   != null) fd.append('longitude', String(data.longitude));
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

    // ── Auth (clinic guard) ───────────────────────────────────────────────────

    /** POST /clinic/login */
    async login(data: { email: string; password: string; remember?: boolean }): Promise<ApiResponse<PetClinic>> {
        return this.request<PetClinic>(`${this.baseURL}/clinic/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /** POST /clinic/logout */
    async logout(): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/clinic/logout`, { method: 'POST' });
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    /**
     * GET /api/clinic/dashboard
     * Returns aggregate stats for clinic dashboard
     */
    async getDashboard(): Promise<ApiResponse<ClinicDashboardStats>> {
        return this.request<ClinicDashboardStats>(`${this.baseURL}/api/clinic/dashboard`);
    }

    // ── Public: Browse clinics (pet owner side) ───────────────────────────────

    /**
     * GET /api/clinics
     * Returns active clinics. If lat/lng is provided the list is sorted by
     * proximity (ascending distance) via the Haversine scope.
     */
    async getClinics(params: ClinicListParams = {}): Promise<ApiResponse<PetClinic[]>> {
        const qs = this.buildQueryString(params);
        return this.request<PetClinic[]>(`${this.baseURL}/api/clinics?${qs}`);
    }

    /** GET /api/clinics/{id} — public clinic profile */
    async getClinic(id: number): Promise<ApiResponse<PetClinic>> {
        return this.request<PetClinic>(`${this.baseURL}/api/clinics/${id}`);
    }

    // ── Clinic: manage own account ────────────────────────────────────────────

    /** GET /api/clinic/profile */
    async getProfile(): Promise<ApiResponse<PetClinic>> {
        return this.request<PetClinic>(`${this.baseURL}/api/clinic/profile`);
    }

    /**
     * POST /api/clinic/profile (_method=PUT for multipart)
     * Accepts profile_photo as File.
     */
    async updateProfile(data: PetClinicUpdateData): Promise<ApiResponse<PetClinic>> {
        const fd = this.toFormData({ ...data, _method: 'PUT' });
        return this.request<PetClinic>(`${this.baseURL}/api/clinic/profile`, {
            method: 'POST',
            body: fd,
        });
    }

    /** POST /api/clinic/toggle-active — clinic deactivates / reactivates itself */
    async toggleActive(): Promise<ApiResponse<PetClinic>> {
        return this.request<PetClinic>(`${this.baseURL}/api/clinic/toggle-active`, {
            method: 'POST',
        });
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    /**
     * Fetch clinics near the given coordinates within `radiusKm`.
     * Wraps getClinics() with lat/lng/radius pre-filled.
     */
    async getNearbyClinics(
        lat: number,
        lng: number,
        radiusKm = 10
    ): Promise<ApiResponse<PetClinic[]>> {
        return this.getClinics({ lat, lng, radius: radiusKm });
    }
}

export const petClinicService = new PetClinicService();