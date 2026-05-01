// resources/js/pages/Clinic/Owners/Index.tsx
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Users, Search, ChevronRight, Loader2, Mail, Phone, MapPin, PawPrint } from 'lucide-react';
import ClinicLayout from '@/layouts/clinic-layout';

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
    pets_count?: number;
    created_at: string;
}

async function fetchOwners(params: Record<string, string> = {}): Promise<Owner[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/clinic/owners${qs ? '?' + qs : ''}`, {
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
    });
    const json = await res.json();
    return json.success ? (json.data ?? []) : [];
}

export default function ClinicOwnersIndex() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        fetchOwners(params).then(data => {
            setOwners(data);
            setLoading(false);
        });
    }, [search]);

    const formatOwnerName = (owner: Owner): string => {
        if (owner.name) return owner.name;
        const parts = [owner.last_name + ',', owner.first_name];
        if (owner.middle_name) parts.push(owner.middle_name.charAt(0) + '.');
        if (owner.suffix) parts.push(owner.suffix);
        return parts.filter(Boolean).join(' ');
    };

    const getInitials = (owner: Owner): string => {
        return (owner.first_name?.[0] || '') + (owner.last_name?.[0] || '');
    };

    return (
        <ClinicLayout>
            <Head title="Pet Owners — Clinic" />
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <Users className="w-6 h-6" /> Pet Owners
                        </h1>
                        <p className="text-teal-100 text-sm mt-1">
                            Browse all registered pet owners and their pets
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    {/* Search */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or email…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 hover:border-teal-300 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-300" />
                        </div>
                    ) : owners.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Users className="w-12 h-12 text-teal-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No owners found</p>
                            {search && (
                                <p className="text-gray-400 text-xs mt-1">
                                    Try adjusting your search term
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {owners.map(owner => (
                                <Link
                                    key={owner.id}
                                    href={route('clinic.owners.show', owner.id)}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-teal-200 transition-all group"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            {owner.profile_photo_url ? (
                                                <img
                                                    src={owner.profile_photo_url}
                                                    alt={owner.name}
                                                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center shrink-0">
                                                    <span className="text-teal-600 font-black text-lg">
                                                        {getInitials(owner)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                                                    {formatOwnerName(owner)}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                                    <p className="text-xs text-gray-500 truncate">{owner.email}</p>
                                                </div>
                                                {owner.phone_number && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <p className="text-xs text-gray-500">{owner.phone_number}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <PawPrint className="w-4 h-4 text-teal-400" />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {owner.pets_count ?? 0} pets
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                owner.is_active
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {owner.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {owner.address && (
                                            <div className="mt-3 flex items-start gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                                                <p className="text-xs text-gray-400 line-clamp-1">{owner.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClinicLayout>
    );
}