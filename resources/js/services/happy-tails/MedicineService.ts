import { BaseService } from './BaseService';
import { ApiResponse, ListParams, MedicineStatus } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the medicines table */
export interface Medicine {
    id: number;
    pet_id: number;
    medicine_name: string;
    dosage?: string;
    start_date?: string;            // 'YYYY-MM-DD'
    end_date?: string;              // 'YYYY-MM-DD'
    notes?: string;
    created_at: string;
    updated_at: string;
    // Server-computed
    status_label?: MedicineStatus;  // 'ongoing' | 'completed' | 'upcoming'
}

export interface MedicineFormData {
    medicine_name: string;
    dosage?: string;
    start_date?: string;            // 'YYYY-MM-DD'
    end_date?: string;              // 'YYYY-MM-DD', must be >= start_date
    notes?: string;
}

export interface MedicineListParams extends ListParams {
    filter?: 'ongoing' | 'completed';
}

// ─── Service class ────────────────────────────────────────────────────────────

class MedicineService extends BaseService {

    // ── CRUD (all scoped to a pet) ────────────────────────────────────────────

    /** GET /api/owner/pets/{petId}/medicines */
    async getMedicines(
        petId: number,
        params: MedicineListParams = {}
    ): Promise<ApiResponse<Medicine[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Medicine[]>(
            `${this.baseURL}/api/owner/pets/${petId}/medicines?${qs}`
        );
    }

    /** GET /api/owner/pets/{petId}/medicines/{id} */
    async getMedicine(petId: number, id: number): Promise<ApiResponse<Medicine>> {
        return this.request<Medicine>(
            `${this.baseURL}/api/owner/pets/${petId}/medicines/${id}`
        );
    }

    /** POST /api/owner/pets/{petId}/medicines */
    async createMedicine(
        petId: number,
        data: MedicineFormData
    ): Promise<ApiResponse<Medicine>> {
        return this.request<Medicine>(
            `${this.baseURL}/api/owner/pets/${petId}/medicines`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    /** PUT /api/owner/pets/{petId}/medicines/{id} */
    async updateMedicine(
        petId: number,
        id: number,
        data: MedicineFormData
    ): Promise<ApiResponse<Medicine>> {
        return this.request<Medicine>(
            `${this.baseURL}/api/owner/pets/${petId}/medicines/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );
    }

    /** DELETE /api/owner/pets/{petId}/medicines/{id} */
    async deleteMedicine(petId: number, id: number): Promise<ApiResponse<null>> {
        return this.request<null>(
            `${this.baseURL}/api/owner/pets/${petId}/medicines/${id}`,
            { method: 'DELETE' }
        );
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    async getOngoing(petId: number): Promise<ApiResponse<Medicine[]>> {
        return this.getMedicines(petId, { filter: 'ongoing' });
    }

    async getCompleted(petId: number): Promise<ApiResponse<Medicine[]>> {
        return this.getMedicines(petId, { filter: 'completed' });
    }
}

export const medicineService = new MedicineService();
