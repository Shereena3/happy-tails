// ─── Base ─────────────────────────────────────────────────────────────────────
export { BaseService } from './BaseService';

// ─── Types ────────────────────────────────────────────────────────────────────
export * from './types';

// ─── PetOwnerService ──────────────────────────────────────────────────────────
export {
    petOwnerService,
    type PetOwner,
    type PetOwnerRegisterData,
    type PetOwnerUpdateData,
    type PetOwnerListParams,
    type DashboardData,
    formatFullName,
    getInitials,
} from './PetOwnerService';

// ─── PetClinicService ─────────────────────────────────────────────────────────
export {
    petClinicService,
    type PetClinic,
    type PetClinicUpdateData,
    type ClinicListParams,
} from './PetClinicService';

// ─── PetService ───────────────────────────────────────────────────────────────
export {
    petService,
    type Pet,
    type PetFormData,
    type PetListParams,
} from './PetService';

// ─── VaccinationService ───────────────────────────────────────────────────────
export {
    vaccinationService,
    type Vaccination,
    type VaccinationFormData,
    type VaccinationListParams,
} from './VaccinationService';

// ─── MedicineService ──────────────────────────────────────────────────────────
export {
    medicineService,
    type Medicine,
    type MedicineFormData,
    type MedicineListParams,
} from './MedicineService';

// ─── GroomingService ──────────────────────────────────────────────────────────
export {
    groomingService,
    type GroomingSession,
    type GroomingFormData,
    type GroomingListParams,
} from './GroomingService';

// ─── ReminderService ──────────────────────────────────────────────────────────
export {
    reminderService,
    type Reminder,
    type ReminderFormData,
    type ReminderUpdateData,
    type ReminderListParams,
} from './ReminderService';

// ─── NotificationService ──────────────────────────────────────────────────────
export {
    notificationService,
    type Notification,
    type NotificationListParams,
    type UnreadCountResponse,
} from './NotificationService';
