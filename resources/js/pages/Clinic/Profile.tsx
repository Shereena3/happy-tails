// resources/js/pages/Clinic/Profile.tsx
// Rendered by: web.php → Clinic/Profile
// API: GET /api/clinic/profile  (PetClinicController::profile)

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Stethoscope, Mail, Phone, MapPin, Edit2,
    Loader2, CheckCircle, XCircle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ClinicLayout from '@/layouts/clinic-layout';

interface Clinic {
    id: number; clinic_name: string; email: string;
    phone_number?: string; address?: string;
    latitude?: number; longitude?: number;
    profile_photo_url?: string; is_active: boolean;
    created_at: string;
}

const getCsrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

export default function ClinicProfile() {
    const [clinic,   setClinic]   = useState<Clinic | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        fetch('/api/clinic/profile', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        }).then(r => r.json()).then(j => {
            if (j.success && j.data) setClinic(j.data);
            setLoading(false);
        });
    }, []);

    const handleToggle = async () => {
        if (!clinic) return;
        const label = clinic.is_active ? 'deactivate' : 'reactivate';
        const result = await Swal.fire({
            title: `${clinic.is_active ? 'Deactivate' : 'Reactivate'} clinic?`,
            text: clinic.is_active
                ? 'Your clinic will no longer be discoverable by pet owners.'
                : 'Your clinic will be visible to pet owners again.',
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: clinic.is_active ? '#dc2626' : '#0d9488',
            confirmButtonText: `Yes, ${label}`,
        });
        if (!result.isConfirmed) return;

        setToggling(true);
        const res = await fetch('/api/clinic/toggle-active', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });
        const json = await res.json();
        setToggling(false);
        if (json.success && json.data) {
            setClinic(json.data);
            Swal.fire({ title: json.message ?? 'Done!', icon: 'success', timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ title: 'Error', text: json.message, icon: 'error' });
        }
    };

    if (loading) return (
        <ClinicLayout>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-teal-300" />
            </div>
        </ClinicLayout>
    );

    if (!clinic) return (
        <ClinicLayout>
            <div className="flex items-center justify-center min-h-screen text-gray-500">Clinic not found</div>
        </ClinicLayout>
    );

    const initials = clinic.clinic_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const memberSince = new Date(clinic.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

    return (
        <ClinicLayout>
            <Head title="Clinic Profile — Happy Tails" />
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                        <div className="flex items-center gap-6">
                            {clinic.profile_photo_url ? (
                                <img src={clinic.profile_photo_url} alt={clinic.clinic_name}
                                    className="w-20 h-20 rounded-3xl object-cover border-4 border-white/30 shadow-xl shrink-0" />
                            ) : (
                                <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-3xl font-black border-4 border-white/30 shrink-0">
                                    {initials}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-black truncate">{clinic.clinic_name}</h1>
                                <p className="text-teal-100 text-sm mt-0.5">{clinic.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${clinic.is_active ? 'bg-white/20 text-white' : 'bg-red-400/30 text-red-100'}`}>
                                        {clinic.is_active
                                            ? <><CheckCircle className="w-3 h-3" /> Active</>
                                            : <><XCircle className="w-3 h-3" /> Inactive</>
                                        }
                                    </span>
                                    <span className="text-teal-200 text-xs">Member since {memberSince}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                    {/* Info card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <Stethoscope className="w-4 h-4 text-teal-500" /> Clinic Information
                            </h2>
                            <Link href={route('clinic.profile.edit')}
                                className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl text-xs font-bold transition-colors">
                                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                            </Link>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { icon: Mail,    label: 'Email',       value: clinic.email          },
                                { icon: Phone,   label: 'Phone',       value: clinic.phone_number ?? '—' },
                                { icon: MapPin,  label: 'Address',     value: clinic.address ?? '—' },
                            ].map(row => (
                                <div key={row.label} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                        <row.icon className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{row.label}</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">{row.value}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Location */}
                            {clinic.latitude && clinic.longitude && (
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coordinates</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                            {Number(clinic.latitude).toFixed(5)}, {Number(clinic.longitude).toFixed(5)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account status card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${clinic.is_active ? 'bg-teal-50' : 'bg-red-50'}`}>
                                    {clinic.is_active
                                        ? <ToggleRight className="w-5 h-5 text-teal-500" />
                                        : <ToggleLeft className="w-5 h-5 text-red-400" />
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                        {clinic.is_active ? 'Clinic is Active' : 'Clinic is Inactive'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {clinic.is_active
                                            ? 'Your clinic is visible and discoverable by pet owners.'
                                            : 'Your clinic is hidden from pet owners. Reactivate to be discoverable again.'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleToggle} disabled={toggling}
                                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                                    clinic.is_active
                                        ? 'bg-red-50 hover:bg-red-100 text-red-500'
                                        : 'bg-teal-50 hover:bg-teal-100 text-teal-600'
                                } disabled:opacity-60`}>
                                {toggling
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : clinic.is_active ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />
                                }
                                {clinic.is_active ? 'Deactivate' : 'Reactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ClinicLayout>
    );
}
