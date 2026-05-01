// resources/js/pages/Owner/Pets/Index.tsx
// API: GET /api/owner/pets

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PawPrint, Plus, Search, Eye, Edit2, Trash2, Loader2, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { petService } from '@/services/happy-tails';
import type { Pet } from '@/services/happy-tails/types';

export default function PetsIndex() {
    const [pets,    setPets]    = useState<Pet[]>([]);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(true);

    const load = async (q = '') => {
        setLoading(true);
        const res = await petService.getPets({ search: q || undefined });
        if (res.success && res.data) setPets(res.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (pet: Pet) => {
        const result = await Swal.fire({
            title: `Remove ${pet.name}?`,
            text: 'If the pet has health records it will be archived, otherwise removed permanently.',
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove',
        });
        if (!result.isConfirmed) return;
        const res = await petService.deletePet(pet.id);
        if (res.success) {
            setPets(p => p.filter(x => x.id !== pet.id));
            Swal.fire({ title: res.message ?? 'Done', icon: 'success', timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ title: 'Error', text: res.message, icon: 'error' });
        }
    };

    const filtered = pets.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.breed ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <OwnerLayout>
            <Head title="My Pets — Happy Tails" />
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-black flex items-center gap-2"><PawPrint className="w-6 h-6" /> My Pets</h1>
                            <p className="text-orange-100 text-sm mt-1">Manage your pets' profiles and health records</p>
                        </div>
                        <Link href={route('owner.pets.create')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 rounded-xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Add Pet
                        </Link>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                    {/* Search */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or breed…"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-orange-300 transition-colors" />
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-300" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <PawPrint className="w-8 h-8 text-orange-200" />
                            </div>
                            <p className="text-gray-500 font-bold">{search ? 'No pets found' : 'No pets yet'}</p>
                            {!search && (
                                <Link href={route('owner.pets.create')}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition-colors mt-4">
                                    <Plus className="w-4 h-4" /> Add Your First Pet
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(pet => (
                                <div key={pet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Photo */}
                                    <div className="h-36 bg-orange-50 flex items-center justify-center">
                                        {pet.photo_path ? (
                                            <img src={`/storage/${pet.photo_path}`} alt={pet.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <PawPrint className="w-12 h-12 text-orange-200" />
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                           <div>
                                                <p className="font-black text-gray-900">{pet.name}</p>

                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    <span className="font-semibold text-gray-600">Breed:</span> {pet.breed ?? 'Unknown'}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    <span className="font-semibold text-gray-600">Age:</span> {pet.age_string}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    <span className="font-semibold text-gray-600">Gender:</span> {pet.sex ?? 'Unknown'}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pet.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {pet.is_active ? 'Active' : 'Archived'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Link href={route('owner.pets.show', pet.id)}
                                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition-colors">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </Link>
                                            <Link href={route('owner.pets.edit', pet.id)}
                                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </Link>
                                            <button onClick={() => handleDelete(pet)}
                                                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}
