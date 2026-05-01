// resources/js/pages/Clinic/Pets/Index.tsx
// API: GET /api/clinic/pets  (PetController::indexForClinic)

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PawPrint, Search, ChevronRight, Loader2, Filter } from 'lucide-react';
import ClinicLayout from '@/layouts/clinic-layout';

interface Pet {
    id: number; name: string; species: string; breed?: string;
    sex?: string; age_string?: string; photo_url?: string; is_active: boolean;
    owner?: { id: number; name?: string; first_name: string; last_name: string };
}

async function fetchPets(params: Record<string, string> = {}): Promise<Pet[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/clinic/pets${qs ? '?' + qs : ''}`, {
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
    });
    const json = await res.json();
    return json.success ? (json.data ?? []) : [];
}

const SPECIES_FILTER = [
    { label: 'All',  value: ''    },
    { label: 'Dogs', value: 'dog' },
    { label: 'Cats', value: 'cat' },
];

export default function ClinicPetsIndex() {
    const [pets,    setPets]    = useState<Pet[]>([]);
    const [search,  setSearch]  = useState('');
    const [species, setSpecies] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params: Record<string,string> = {};
        if (search)  params.search  = search;   
        if (species) params.species = species;
        fetchPets(params).then(d => { setPets(d); setLoading(false); });
    }, [search, species]);

    return (
        <ClinicLayout>
            <Head title="All Pets — Clinic" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                        <h1 className="text-2xl font-black flex items-center gap-2"><PawPrint className="w-6 h-6" /> All Pets</h1>
                        <p className="text-teal-100 text-sm mt-1">Monitor all registered pets across owners</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or breed…"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 hover:border-teal-300 transition-colors" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                {SPECIES_FILTER.map(f => (
                                    <button key={f.value} onClick={() => setSpecies(f.value)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${species === f.value ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600'}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-300" /></div>
                    ) : pets.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <PawPrint className="w-12 h-12 text-teal-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No pets found</p>
                        </div>
                    ) : (
                        <>
                            {Object.entries(
                                pets.reduce((groups: Record<string, Pet[]>, pet) => {
                                    const ownerName =
                                        pet.owner?.name ||
                                        `${pet.owner?.first_name ?? ''} ${pet.owner?.last_name ?? ''}`.trim() ||
                                        'Unknown Owner';

                                    if (!groups[ownerName]) groups[ownerName] = [];

                                    groups[ownerName].push(pet);
                                    return groups;
                                }, {})
                            ).map(([ownerName, ownerPets]) => (
                                <div key={ownerName} className="mb-8">

                                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 mb-3 shadow-sm">
    
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                        <PawPrint className="w-5 h-5 text-teal-600" />
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Pet Owner</p>
                                        <p className="text-lg font-extrabold text-black-900 tracking-tight">
                                            {ownerName}
                                        </p>
                                    </div>
                                </div>

                                {/* Optional count */}
                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                                    {ownerPets.length} pets
                                </span>

                            </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {ownerPets.map(pet => (
                                            <Link key={pet.id} href={`/clinic/pets/${pet.id}`}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-teal-200 transition-all group">

                                                <div className="h-32 bg-orange-50 flex items-center justify-center relative">
                                                    {pet.photo_url ? (
                                                        <img src={pet.photo_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <PawPrint className="w-10 h-10 text-orange-200" />
                                                    )}
                                                </div>

                                                <div className="p-4">
                                                    <p className="font-black text-gray-900">{pet.name}</p>
                                                    <p className="text-xs text-gray-400">{pet.species} · {pet.breed ?? '—'}</p>
                                                    <p className="text-xs text-gray-400">{pet.sex ?? '—'} · {pet.age_string}</p>
                                                </div>

                                            </Link>
                                        ))}
                                    </div>

                                </div>
                            ))}
                        </>
                    )
                }
                </div>
            </div>
        </ClinicLayout>
    );
}
