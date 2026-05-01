import { BaseService } from './BaseService';
import { ApiResponse, ListParams, PetSpecies, PetSex, PetHealthSummary } from './types';
import type { Reminder } from './ReminderService';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the pets table */
export interface Pet {
    id: number;
    pet_owner_id: number;
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthday?: string;          // 'YYYY-MM-DD'
    photo_path?: string;
    photo_url?: string;         // server-appended public URL
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Server-computed
    age?: number;               // in years, null if no birthday
    age_string?: string;        // "2 years" / "4 months" / "Unknown"
    // Eager-loaded
    health_summary?: PetHealthSummary;
    upcoming_reminders?: Reminder[];
}

/** Payload for creating or updating a pet */
export interface PetFormData {
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthday?: string;          // 'YYYY-MM-DD'
    photo?: File;               // new photo to upload
    remove_photo?: boolean;     // true → clear existing photo
}

export interface PetListParams extends ListParams {
    species?: PetSpecies;
    is_active?: boolean;
}

// ─── Service class ────────────────────────────────────────────────────────────

class PetService extends BaseService {

    // ── Internal helpers ──────────────────────────────────────────────────────

    private toFormData(data: PetFormData & { _method?: string }): FormData {
        const fd = new FormData();
        if (data._method)         fd.append('_method', data._method);
        fd.append('name', data.name);
        fd.append('species', data.species);
        if (data.breed)           fd.append('breed', data.breed);
        if (data.sex)             fd.append('sex', data.sex);
        if (data.birthday)        fd.append('birthday', data.birthday);
        if (data.photo instanceof File) {
            fd.append('photo', data.photo);
        } else if (data.remove_photo) {
            fd.append('remove_photo', '1');
        }
        return fd;
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /** GET /api/owner/pets */
    async getPets(params: PetListParams = {}): Promise<ApiResponse<Pet[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Pet[]>(`${this.baseURL}/api/owner/pets?${qs}`);
    }

    /**
     * GET /api/owner/pets/{id}
     * Includes health_summary and upcoming_reminders.
     */
    async getPet(id: number): Promise<ApiResponse<Pet>> {
        return this.request<Pet>(`${this.baseURL}/api/owner/pets/${id}`);
    }

    /**
     * POST /api/owner/pets (multipart/form-data)
     * Submits pet data + optional photo.
     */
    async createPet(data: PetFormData): Promise<ApiResponse<Pet>> {
        return this.request<Pet>(`${this.baseURL}/api/owner/pets`, {
            method: 'POST',
            body: this.toFormData(data),
        });
    }

    /**
     * POST /api/owner/pets/{id} (_method=PUT for multipart)
     * Sends only changed fields + optional new photo.
     */
    async updatePet(id: number, data: PetFormData): Promise<ApiResponse<Pet>> {
        const fd = this.toFormData({ ...data, _method: 'PUT' });
        return this.request<Pet>(`${this.baseURL}/api/owner/pets/${id}`, {
            method: 'POST',
            body: fd,
        });
    }

    /**
     * DELETE /api/owner/pets/{id}
     * Server archives the pet (sets is_active=false) if health records exist,
     * or hard-deletes if the pet has no history.
     */
    async deletePet(id: number): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/api/owner/pets/${id}`, {
            method: 'DELETE',
        });
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    async getDogs(params: Omit<PetListParams, 'species'> = {}): Promise<ApiResponse<Pet[]>> {
        return this.getPets({ ...params, species: 'dog' });
    }

    async getCats(params: Omit<PetListParams, 'species'> = {}): Promise<ApiResponse<Pet[]>> {
        return this.getPets({ ...params, species: 'cat' });
    }

    async getActivePets(): Promise<ApiResponse<Pet[]>> {
        return this.getPets({ is_active: true });
    }
}

export const petService = new PetService();
