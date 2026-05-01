// ─── Generic API Response ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
    pagination?: PaginationData;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
}

// ─── Common Query Params ──────────────────────────────────────────────────────

export interface ListParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type PetSpecies = 'dog' | 'cat';
export type PetSex = 'male' | 'female';

export type ReminderType =
    | 'vaccination'
    | 'medicine'
    | 'grooming'
    | 'vet_visit'
    | 'other';

export type NotificationType =
    | 'reminder_due'
    | 'vaccination_due'
    | 'medicine_due'
    | 'grooming_due'
    | 'vet_visit_due'
    | 'general';

export type MedicineStatus = 'ongoing' | 'completed' | 'upcoming';

/** Suffix options for owner name */
export type NameSuffix = 'Jr.' | 'Sr.' | 'II' | 'III' | 'IV' | '';
export const SUFFIX_OPTIONS: NameSuffix[] = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

export const GROOMING_SERVICE_TYPES = [
    'Bath',
    'Haircut',
    'Nail Trim',
    'Ear Cleaning',
    'Full Groom',
    'Other',
] as const;
export type GroomingServiceType = typeof GROOMING_SERVICE_TYPES[number];

// ─── Shared Inertia Data ──────────────────────────────────────────────────────

export interface SharedData {
    auth: {
        owner: {
            id: number;
            last_name: string;
            first_name: string;
            middle_name?: string;
            suffix?: string;
            name?: string;              // server-computed full name
            profile_photo_path?: string;
            profile_photo_url?: string;
            email: string;
            phone_number?: string;
            address?: string;
            is_active: boolean;
            created_at: string;
        } | null;
        clinic: {
            id: number;
            clinic_name: string;
            profile_photo_path?: string;
            profile_photo_url?: string;
            email: string;
            phone_number?: string;
            address?: string;
            latitude?: number;
            longitude?: number;
            is_active: boolean;
            created_at: string;
        } | null;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    errors?: Record<string, string>;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface OwnerDashboardStats {
    total_pets: number;
    active_pets: number;
    total_vaccinations: number;
    total_medicines: number;
    total_grooming_sessions: number;
    pending_reminders: number;
    unread_notifications: number;
}

export interface PetHealthSummary {
    vaccinations: number;
    medicines: number;
    grooming_sessions: number;
    pending_reminders: number;
    last_vaccination?: string;
    last_grooming?: string;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface StatusBadge { label: string; color: string; }
export interface NavItem {
    title: string;
    href: string;
    icon?: any;
    badge?: string | number;
    children?: NavItem[];
}
export interface BreadcrumbItem { label: string; href?: string; active?: boolean; }
export interface ToastMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
