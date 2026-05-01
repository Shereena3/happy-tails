// resources/js/pages/Owner/Clinics/Index.tsx
// API: GET /api/clinics?search=&lat=&lng=&radius=

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import {
    MapPin, Search, Phone, ChevronRight,
    Loader2, Stethoscope, Navigation, X, Star,
} from 'lucide-react';
import OwnerLayout from '@/layouts/owner-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clinic {
    id: number;
    clinic_name: string;
    address?: string | null;
    phone_number?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    profile_photo_url?: string | null;
    distance?: number | null;
}

// ─── Clinic Card ──────────────────────────────────────────────────────────────

function ClinicCard({ clinic }: { clinic: Clinic }) {
    return (
        <Link
            href={route('clinics.show', clinic.id)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
        >
            {/* Photo / placeholder */}
            <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center relative overflow-hidden">
                {clinic.profile_photo_url ? (
                    <img
                        src={clinic.profile_photo_url}
                        alt={clinic.clinic_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-orange-200">
                        <Stethoscope className="w-12 h-12" />
                    </div>
                )}
                {clinic.distance != null && (
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-bold text-orange-600 shadow-sm border border-orange-100">
                        <Navigation className="w-3 h-3" />
                        {clinic.distance < 1
                            ? `${(clinic.distance * 1000).toFixed(0)} m`
                            : `${clinic.distance.toFixed(1)} km`}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                    <p className="font-black text-gray-900 text-sm group-hover:text-orange-600 transition-colors leading-snug">
                        {clinic.clinic_name}
                    </p>
                    {clinic.address && (
                        <p className="text-xs text-gray-400 mt-1 flex items-start gap-1.5 leading-relaxed">
                            <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-orange-300" />
                            {clinic.address}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between">
                    {clinic.phone_number ? (
                        <a
                            href={`tel:${clinic.phone_number}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5 text-orange-400" />
                            {clinic.phone_number}
                        </a>
                    ) : (
                        <span className="text-xs text-gray-300">No phone listed</span>
                    )}
                    <span className="flex items-center gap-0.5 text-xs font-bold text-orange-500">
                        View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ClinicsIndex() {
    const [clinics,   setClinics]   = useState<Clinic[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [search,    setSearch]    = useState('');
    const [locating,  setLocating]  = useState(false);
    const [coords,    setCoords]    = useState<{ lat: number; lng: number } | null>(null);
    const [locErr,    setLocErr]    = useState('');

    const fetchClinics = useCallback(async (q = '', lat?: number, lng?: number) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (q)   params.set('search', q);
        if (lat) params.set('lat', String(lat));
        if (lng) params.set('lng', String(lng));

        try {
            const res  = await fetch(`/api/clinics?${params}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            if (json.success) setClinics(json.data ?? []);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => { fetchClinics(); }, [fetchClinics]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => {
            fetchClinics(search, coords?.lat, coords?.lng);
        }, 400);
        return () => clearTimeout(t);
    }, [search, coords, fetchClinics]);

    const handleLocate = () => {
        if (!navigator.geolocation) { setLocErr('Geolocation not supported.'); return; }
        setLocating(true);
        setLocErr('');
        navigator.geolocation.getCurrentPosition(
            pos => {
                const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoords(c);
                setLocating(false);
                fetchClinics(search, c.lat, c.lng);
            },
            () => { setLocErr('Could not get your location.'); setLocating(false); },
            { timeout: 8000 }
        );
    };
    const handleCitySearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setLocErr('');

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
        );

        const data = await res.json();

        if (!data.length) {
            setLocErr('City not found.');
            setLoading(false);
            return;
        }

        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        setCoords({ lat, lng });
        fetchClinics('', lat, lng);
    } catch {
        setLocErr('Failed to search city.');
        setLoading(false);
    }
};

    const clearLocation = () => {
        setCoords(null);
        setLocErr('');
        fetchClinics(search);
    };

    return (
        <OwnerLayout>
            <Head title="Find a Clinic — Happy Tails" />
            <div className="min-h-screen bg-slate-50">

                {/* Hero */}
                <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white relative overflow-hidden">
                    <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight">Find a Clinic</h1>
                        </div>
                        <p className="text-orange-100 text-sm">
                            Search for pet clinics near you or browse all registered clinics.
                        </p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                    {/* Search bar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by clinic name or address…"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-orange-300 transition-colors"
                                />
                            </div>

                            {/* Locate me */}
                            {coords ? (
                                <button
                                    onClick={clearLocation}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-sm font-bold hover:bg-orange-100 transition-colors whitespace-nowrap"
                                >
                                    <X className="w-4 h-4" /> Clear Location
                                </button>
                            ) : (
                                <button
                                    onClick={handleLocate}
                                    disabled={locating}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-colors whitespace-nowrap shadow-sm"
                                >
                                    {locating
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Navigation className="w-4 h-4" />}
                                    {locating ? 'Locating…' : 'Near Me'}
                                </button>
                            )}
                        </div>

                        {/* Status pills */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            {coords && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
                                    <Navigation className="w-3 h-3" /> Showing nearby clinics
                                </span>
                            )}
                            {locErr && (
                                <span className="text-xs text-red-500 font-medium">{locErr}</span>
                            )}
                            {!loading && (
                                <span className="text-xs text-gray-400 font-medium ml-auto">
                                    {clinics.length} clinic{clinics.length !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </div>
                    </div>
                            {coords && (
                    <div className="mb-4">
                        <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-orange-500" />
                            Clinics Near Me
                        </h2>
                    </div>
                )}
                    {/* Results */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-300" />
                        </div>
                    ) : clinics.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Stethoscope className="w-7 h-7 text-orange-200" />
                            </div>
                            <p className="font-bold text-gray-500">
                                {search ? 'No clinics match your search' : 'No clinics registered yet'}
                            </p>
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="mt-3 text-xs text-orange-500 font-bold hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clinics.map(c => <ClinicCard key={c.id} clinic={c} />)}
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}
