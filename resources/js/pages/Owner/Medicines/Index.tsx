// resources/js/pages/Owner/Medicines/Index.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Pill, Plus, ChevronLeft, Edit2, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { medicineService } from '@/services/happy-tails';
import type { Medicine } from '@/services/happy-tails/types';

export default function MedicinesIndex() {
    const { petId } = usePage<{ props: { petId: string } }>().props;
    const [meds, setMeds] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        medicineService.getMedicines(Number(petId)).then(r => { if (r.data) setMeds(r.data); setLoading(false); });
    }, [petId]);

    const handleDelete = async (id: number) => {
        const r = await Swal.fire({ title: 'Delete medicine?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (r.isConfirmed) { await medicineService.deleteMedicine(Number(petId), id); setMeds(p => p.filter(m => m.id !== id)); }
    };

    const statusColor = (m: Medicine) => {
        if (!m.end_date) return 'bg-green-50 text-green-700 border-green-200';
        const end = new Date(m.end_date);
        return end < new Date() ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-green-50 text-green-700 border-green-200';
    };
    const statusLabel = (m: Medicine) => {
        if (!m.end_date) return 'Ongoing';
        return new Date(m.end_date) < new Date() ? 'Completed' : 'Ongoing';
    };

    return (
        <OwnerLayout>
            <Head title="Medicines — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <Link href={route('owner.pets.show', petId)} className="inline-flex items-center gap-1 text-green-100 hover:text-white text-sm font-semibold mb-3"><ChevronLeft className="w-4 h-4" /> Back</Link>
                            <h1 className="text-2xl font-black flex items-center gap-2"><Pill className="w-6 h-6" /> Medicines</h1>
                        </div>
                        <Link href={route('owner.pets.medicines.create', petId)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 rounded-xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Add
                        </Link>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-green-300" /></div>
                    : meds.length === 0 ? (
                        <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Pill className="w-10 h-10 text-green-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">No medicines recorded</p>
                            <Link href={route('owner.pets.medicines.create', petId)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold mt-4 hover:bg-green-600 transition-colors"><Plus className="w-3.5 h-3.5" /> Add Medicine</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {meds.map(m => (
                                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0"><Pill className="w-5 h-5 text-green-400" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-800">{m.medicine_name}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(m)}`}>{statusLabel(m)}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">{m.dosage ?? '—'} · {m.start_date ?? '—'} → {m.end_date ?? 'ongoing'}</p>
                                        {m.notes && <p className="text-xs text-gray-500 mt-1">{m.notes}</p>}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Link href={route('owner.pets.medicines.edit', { petId, id: m.id })} className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-500 transition-colors"><Edit2 className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDelete(m.id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
