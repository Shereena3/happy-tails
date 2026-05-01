// resources/js/pages/Owner/Clinics/Show.tsx
// API: GET /api/clinics/{id}

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    MapPin, Phone, Mail, ChevronLeft, Stethoscope,
    Loader2, ExternalLink, CheckCircle,
} from 'lucide-react';
import OwnerLayout from '@/layouts/owner-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clinic {
    id: number;
    clinic_name: string;
    email: string;
    address?: string | null;
    phone_number?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    profile_photo_url?: string | null;
    is_active: boolean;
    clinic_hours?: string | null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function isClinicOpen(hours?: string | null) {
    if (!hours) return false;

    const [open, close] = hours.split('-');
    if (!open || !close) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);

    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

export default function ClinicShow() {
    const { clinicId } = usePage<{ props: { clinicId: string } }>().props;
    const [clinic,  setClinic]  = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(`/api/clinics/${clinicId}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then(r => r.json())
            .then(json => {
                if (json.success && json.data) setClinic(json.data);
                else setNotFound(true);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [clinicId]);

    if (loading) {
        return (
            <OwnerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-300" />
                </div>
            </OwnerLayout>
        );
    }

    if (notFound || !clinic) {
        return (
            <OwnerLayout>
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-orange-200" />
                    </div>
                    <p className="font-bold text-gray-500">Clinic not found.</p>
                    <Link href={route('clinics.index')}
                        className="text-sm text-orange-500 font-bold hover:underline flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Back to Clinics
                    </Link>
                </div>
            </OwnerLayout>
        );
    }

    const mapsUrl = clinic.latitude && clinic.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
        : clinic.address
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`
            : null;

    return (
        <OwnerLayout>
            <Head title={`${clinic.clinic_name} — Happy Tails`} />
            <div className="min-h-screen bg-slate-50">

                {/* Hero banner */}
                <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white relative overflow-hidden">
                    <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />

                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
                        <Link
                            href={route('clinics.index')}
                            className="inline-flex items-center gap-1.5 text-orange-100 hover:text-white text-sm font-semibold mb-6 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Clinics
                        </Link>

                        <div className="flex items-center gap-5">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-lg overflow-hidden shrink-0">
                                {clinic.profile_photo_url ? (
                                    <img
                                        src={clinic.profile_photo_url}
                                        alt={clinic.clinic_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                        <Stethoscope className="w-8 h-8 text-white/70" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-black tracking-tight leading-tight">
                                        {clinic.clinic_name}
                                    </h1>
                                    {clinic.is_active && (
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-bold">
                                            <CheckCircle className="w-3 h-3" /> Active
                                        </span>
                                    )}
                                </div>
                                {clinic.address && (
                                    <p className="text-orange-100 text-sm mt-1 flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        {clinic.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                    {/* Contact info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-orange-500" /> Contact Information
                        </h2>

                        <div className="space-y-3">
                            {clinic.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium">Email</p>
                                        <a
                                            href={`mailto:${clinic.email}`}
                                            className="text-sm font-bold text-gray-800 hover:text-orange-600 transition-colors"
                                        >
                                            {clinic.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {clinic.phone_number && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium">Phone</p>
                                        <a
                                            href={`tel:${clinic.phone_number}`}
                                            className="text-sm font-bold text-gray-800 hover:text-orange-600 transition-colors"
                                        >
                                            {clinic.phone_number}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {clinic.address && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium">Address</p>
                                        <p className="text-sm font-bold text-gray-800">{clinic.address}</p>
                                    </div>
                                </div>
                            )}
                          {clinic.clinic_hours && (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className="text-orange-500"></span>
                <h3 className="text-sm font-bold text-gray-800">
                    Clinic Hours
                </h3>
            </div>

            {/* STATUS */}
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    isClinicOpen(clinic.clinic_hours)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                }`}
            >
                <span className={`w-2 h-2 rounded-full ${
                    isClinicOpen(clinic.clinic_hours) ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {isClinicOpen(clinic.clinic_hours) ? 'Open Now' : 'Closed'}
            </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* LEFT: MON–FRI */}
            <div className="space-y-1.5">
                {clinic.clinic_hours
                    .replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):?/g, '|$1:')
                    .split('|')
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((hour, index) => {
                        const colonIndex = hour.indexOf(':');
                        const day = hour.substring(0, colonIndex).trim();
                        const time = hour.substring(colonIndex + 1).trim();

                        return (
                            <div
                                key={index}
                                className="flex justify-between items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                            >
                                <span className="font-medium text-gray-800">
                                    {day}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {time}
                                </span>
                            </div>
                        );
                    })}
            </div>

            {/* RIGHT: SAT–SUN */}
            <div className="space-y-1.5">
                {clinic.clinic_hours
                    .replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):?/g, '|$1:')
                    .split('|')
                    .filter(Boolean)
                    .slice(5)
                    .map((hour, index) => {
                        const colonIndex = hour.indexOf(':');
                        const day = hour.substring(0, colonIndex).trim();
                        const time = hour.substring(colonIndex + 1).trim();

                        return (
                            <div
                                key={index}
                                className="flex justify-between items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm"
                            >
                                <span className="font-medium text-gray-800">
                                    {day}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {time}
                                </span>
                            </div>
                        );
                    })}
            </div>

        </div>
    </div>
)}
                        </div>
                    </div>

                    {/* Get directions */}
                    {mapsUrl && (
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-sm hover:shadow-md transition-all"
                        >
                            <MapPin className="w-4 h-4" />
                            Get Directions
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                    )}

                    {/* No info fallback */}
                    {!clinic.phone_number && !clinic.address && !clinic.email && (
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
                            <p className="text-gray-400 text-sm font-medium">
                                No contact details available yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}
