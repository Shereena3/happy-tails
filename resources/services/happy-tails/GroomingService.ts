import { BaseService } from './BaseService';
import { ApiResponse, ListParams, GroomingServiceType, GROOMING_SERVICE_TYPES } from './types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Mirrors the grooming_sessions table */
export interface GroomingSession {
    id: number;
    pet_id: number;
    date: string;                   // 'YYYY-MM-DD'
    service_type?: GroomingServiceType;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface GroomingFormData {
    date: string;                   // 'YYYY-MM-DD'
    service_type?: GroomingServiceType;
    notes?: string;
}

export interface GroomingListParams extends ListParams {
    filter?: 'upcoming' | 'past';
}

// ─── Service class ────────────────────────────────────────────────────────────

class GroomingService extends BaseService {

    /** All valid service types — mirrors GroomingSession::SERVICE_TYPES on the server */
    readonly serviceTypes: readonly GroomingServiceType[] = GROOMING_SERVICE_TYPES;

    // ── CRUD (all scoped to a pet) ────────────────────────────────────────────

    /** GET /api/owner/pets/{petId}/grooming */
    async getSessions(
        petId: number,
        params: GroomingListParams = {}
    ): Promise<ApiResponse<GroomingSession[]>> {
        const qs = this.buildQueryString(params);
        return this.request<GroomingSession[]>(
            `${this.baseURL}/api/owner/pets/${petId}/grooming?${qs}`
        );
    }

    /** GET /api/owner/pets/{petId}/grooming/{id} */
    async getSession(petId: number, id: number): Promise<ApiResponse<GroomingSession>> {
        return this.request<GroomingSession>(
            `${this.baseURL}/api/owner/pets/${petId}/grooming/${id}`
        );
    }

    /** POST /api/owner/pets/{petId}/grooming */
    async createSession(
        petId: number,
        data: GroomingFormData
    ): Promise<ApiResponse<GroomingSession>> {
        return this.request<GroomingSession>(
            `${this.baseURL}/api/owner/pets/${petId}/grooming`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    /** PUT /api/owner/pets/{petId}/grooming/{id} */
    async updateSession(
        petId: number,
        id: number,
        data: GroomingFormData
    ): Promise<ApiResponse<GroomingSession>> {
        return this.request<GroomingSession>(
            `${this.baseURL}/api/owner/pets/${petId}/grooming/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            }
        );
    }

    /** DELETE /api/owner/pets/{petId}/grooming/{id} */
    async deleteSession(petId: number, id: number): Promise<ApiResponse<null>> {
        return this.request<null>(
            `${this.baseURL}/api/owner/pets/${petId}/grooming/${id}`,
            { method: 'DELETE' }
        );
    }

    // ── Convenience helpers ───────────────────────────────────────────────────

    async getUpcoming(petId: number): Promise<ApiResponse<GroomingSession[]>> {
        return this.getSessions(petId, { filter: 'upcoming' });
    }

    async getPast(petId: number): Promise<ApiResponse<GroomingSession[]>> {
        return this.getSessions(petId, { filter: 'past' });
    }
}

export const groomingService = new GroomingService();
