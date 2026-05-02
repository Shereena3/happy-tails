import { BaseService } from './BaseService';
import { ApiResponse, ListParams, PetSpecies, PetSex, PetHealthSummary } from './types';
import type { Reminder } from './ReminderService';

export interface Pet {
    id: number;
    pet_owner_id: number;
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthday?: string;
    photo_path?: string;
    photo_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    age?: number;
    age_string?: string;
    health_summary?: PetHealthSummary;
    upcoming_reminders?: Reminder[];
}

export interface PetFormData {
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthday?: string;
    photo?: File;
    remove_photo?: boolean;
}

export interface PetListParams extends ListParams {
    species?: PetSpecies;
    is_active?: boolean;
}

class PetService extends BaseService {
    private toFormData(data: PetFormData & { _method?: string }): FormData {
        const fd = new FormData();

        if (data._method) fd.append('_method', data._method);
        fd.append('name', data.name);
        fd.append('species', data.species);

        if (data.breed) fd.append('breed', data.breed);
        if (data.sex) fd.append('sex', data.sex);
        if (data.birthday) fd.append('birthday', data.birthday);

        if (data.photo instanceof File) {
            fd.append('photo', data.photo);
        } else if (data.remove_photo) {
            fd.append('remove_photo', '1');
        }

        return fd;
    }

    async getPets(params: PetListParams = {}): Promise<ApiResponse<Pet[]>> {
        const qs = this.buildQueryString(params);
        return this.request<Pet[]>(`${this.baseURL}/api/owner/pets?${qs}`);
    }

    async getPet(id: number): Promise<ApiResponse<Pet>> {
        return this.request<Pet>(`${this.baseURL}/api/owner/pets/${id}`);
    }

    async createPet(data: PetFormData): Promise<ApiResponse<Pet>> {
        return this.request<Pet>(`${this.baseURL}/api/owner/pets`, {
            method: 'POST',
            body: this.toFormData(data),
        });
    }

    async updatePet(id: number, data: PetFormData): Promise<ApiResponse<Pet>> {
        const fd = this.toFormData({ ...data, _method: 'PUT' });

        return this.request<Pet>(`${this.baseURL}/api/owner/pets/${id}`, {
            method: 'POST',
            body: fd,
        });
    }

    async deletePet(id: number): Promise<ApiResponse<null>> {
        return this.request<null>(`${this.baseURL}/api/owner/pets/${id}`, {
            method: 'DELETE',
        });
    }

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