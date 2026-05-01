import { BaseService } from './BaseService';
import { ApiResponse, ListParams } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the vaccinations table */
export interface Vaccination {
    id: number;
    pet_id: number;
    vaccine_name: string;
    date_administered?: string;     // 'YYYY-MM-DD'
    next_due_date?: string;         // 'YYYY-MM-DD'
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface VaccinationFormData {
    vaccine_name: string;
    date_administered?: string;     // 'YYYY-MM-DD'
    next_due_date?: string;         // 'YYYY-MM-DD', must be >= date_administered
    notes?: string;
}

export interface VaccinationListParams extends ListParams {
    filter?: 'overdue' | 'due_soon';
}

// ─── Service class ────────────────────────────────────────────────────────────

class VaccinationService extends BaseService {

    // ── CRUD (all scoped to a pet) ────────────────────────────────────────────

    /** GET /api/owner/pets/{petId}/vaccinations */
    async getVaccinations(
        petId: number,
        params: VaccinationListParams = {}
    ): Promise<ApiResponse<Vaccination[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Vaccination[]>(
            `${this.baseURL}/api/owner/pets/${petId}/vaccinations?${qs}`
        );
    }

    /** GET /api/owner/pets/{petId}/vaccinations/{id} */
    async getVaccination(petId: number, id: number): Promise<ApiResponse<Vaccination>> {
        return this.request<Vaccination>(
            `${this.baseURL}/api/owner/pets/${petId}/vaccinations/${id}`
        );
    }

    /** POST /api/owner/pets/{petId}/vaccinations */
    async createVaccination(
        petId: number,
        data: VaccinationFormData
    ): Promise<ApiResponse<Vaccination>> {
        return this.request<Vaccination>(
            `${this.baseURL}/api/owner/pets/${petId}/vaccinations`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    /** PUT /api/owner/pets/{petId}/vaccinations/{id} */
    async updateVaccination(
        petId: number,
        id: number,
        data: VaccinationFormData
    ): Promise<ApiResponse<Vaccination>> {
        return this.request<Vaccination>(
            `${this.baseURL}/api/owner/pets/${petId}/vaccinations/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );
    }

    /** DELETE /api/owner/pets/{petId}/vaccinations/{id} */
    async deleteVaccination(petId: number, id: number): Promise<ApiResponse<null>> {
        return this.request<null>(
            `${this.baseURL}/api/owner/pets/${petId}/vaccinations/${id}`,
            { method: 'DELETE' }
        );
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    async getOverdue(petId: number): Promise<ApiResponse<Vaccination[]>> {
        return this.getVaccinations(petId, { filter: 'overdue' });
    }

    async getDueSoon(petId: number): Promise<ApiResponse<Vaccination[]>> {
        return this.getVaccinations(petId, { filter: 'due_soon' });
    }
}

export const vaccinationService = new VaccinationService();
