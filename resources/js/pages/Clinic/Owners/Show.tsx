// resources/js/pages/Clinic/Owners/Show.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Users, ChevronLeft, Mail, Phone, MapPin, PawPrint,
    Calendar, Loader2, Edit2, Activity, Syringe, Pill, Scissors,
    Clock, AlertCircle
} from 'lucide-react';
import ClinicLayout from '@/layouts/clinic-layout';

interface Pet {
    id: number;
    name: string;
    species: string;
    breed?: string;
    sex?: string;
    birthday?: string;
    age_string?: string;
    photo_url?: string;
    is_active: boolean;
    health_summary?: {
        vaccinations: number;
        medicines: number;
        grooming_sessions: number;
        pending_reminders: number;
    };
}

interface Owner {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
    name?: string;
    email: string;
    phone_number?: string;
    address?: string;
    profile_photo_url?: string;
    is_active: boolean;
    created_at: string;
    email_verified_at?: string;
    stats?: {
        total_pets: number;
        active_pets: number;
        total_vaccinations: number;
        total_medicines: number;
        total_grooming_sessions: number;
        pending_reminders: number;
    };
    pets?: Pet[];
}

export default function ClinicOwnerShow() {
    const { ownerId } = usePage<{ props: { ownerId: string } }>().props;
    const [owner, setOwner] = useState<Owner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/clinic/owners/${ownerId}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then(r => r.json())
            .then(json => {
                if (json.success && json.data) setOwner(json.data);
                setLoading(false);
            });
    }, [ownerId]);

    const formatOwnerName = (o: Owner): string => {
        if (o.name) return o.name;
        const parts = [o.last_name + ',', o.first_name];
        if (o.middle_name) parts.push(o.middle_name.charAt(0) + '.');
        if (o.suffix) parts.push(o.suffix);
        return parts.filter(Boolean).join(' ');
    };

    const getInitials = (o: Owner): string => {
        return (o.first_name?.[0] || '') + (o.last_name?.[0] || '');
    };

    const memberSince = owner ? new Date(owner.created_at).toLocaleDateString('en-PH', {
        month: 'long',
        year: 'numeric'
    }) : '';

    if (loading) {
        return (
            <ClinicLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-300" />
                </div>
            </ClinicLayout>
        );
    }

    if (!owner) {
        return (
            <ClinicLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-bold">Owner not found</p>
                    </div>
                </div>
            </ClinicLayout>
        );
    }

    const stats = owner.stats ?? {
        total_pets: 0,
        active_pets: 0,
        total_vaccinations: 0,
        total_medicines: 0,
        total_grooming_sessions: 0,
        pending_reminders: 0,
    };

    const StatCard = ({ label, value, icon: Icon, color }: {
        label: string;
        value: number;
        icon: any;
        color: string;
    }) => (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{label}</p>
            </div>
        </div>
    );

    return (
        <ClinicLayout>
            <Head title={`${formatOwnerName(owner)} — Owner Profile`} />
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                        <Link
                            href={route('clinic.owners.index')}
                            className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white text-sm font-semibold mb-4"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Owners
                        </Link>

                        <div className="flex items-center gap-5">
                            {owner.profile_photo_url ? (
                                <img
                                    src={owner.profile_photo_url}
                                    alt={owner.name}
                                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 shrink-0">
                                    <span className="text-2xl font-black text-white">
                                        {getInitials(owner)}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-black">{formatOwnerName(owner)}</h1>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        owner.is_active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-red-400/30 text-red-100'
                                    }`}>
                                        {owner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-teal-100 text-sm">
                                        Member since {memberSince}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-teal-500" /> Contact Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{owner.email}</p>
                                    {owner.email_verified_at && (
                                        <p className="text-xs text-green-500 mt-0.5">✓ Verified</p>
                                    )}
                                </div>
                            </div>

                            {owner.phone_number && (
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{owner.phone_number}</p>
                                    </div>
                                </div>
                            )}

                            {owner.address && (
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{owner.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard label="Total Pets" value={stats.total_pets} icon={PawPrint} color="bg-teal-500" />
                        <StatCard label="Active Pets" value={stats.active_pets} icon={Activity} color="bg-green-500" />
                        <StatCard label="Vaccinations" value={stats.total_vaccinations} icon={Syringe} color="bg-blue-500" />
                        <StatCard label="Medicines" value={stats.total_medicines} icon={Pill} color="bg-green-500" />
                        <StatCard label="Grooming" value={stats.total_grooming_sessions} icon={Scissors} color="bg-pink-500" />
                        <StatCard label="Pending Reminders" value={stats.pending_reminders} icon={Clock} color="bg-amber-500" />
                    </div>

                    {/* Pets List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <PawPrint className="w-4 h-4 text-teal-500" /> Pets ({stats.total_pets})
                            </h2>
                        </div>

                        <div className="p-6">
                            {!owner.pets || owner.pets.length === 0 ? (
                                <div className="text-center py-10">
                                    <PawPrint className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 font-semibold">No pets registered</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {owner.pets.map(pet => (
                                        <Link
                                            key={pet.id}
                                            href={route('clinic.pets.show', pet.id)}
                                            className="bg-gray-50 rounded-xl p-4 hover:bg-teal-50 transition-colors group"
                                        >
                                            <div className="flex items-start gap-3">
                                                {pet.photo_url ? (
                                                    <img
                                                        src={pet.photo_url}
                                                        alt={pet.name}
                                                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                                                        <PawPrint className="w-6 h-6 text-teal-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                                        {pet.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                                                        {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            {pet.age_string || 'Age unknown'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                                            pet.is_active
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {pet.is_active ? 'Active' : 'Archived'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-teal-400 rotate-180 shrink-0 mt-2" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ClinicLayout>
    );
}