// resources/js/pages/Clinic/Vaccinations/Index.tsx
// API: GET /api/clinic/pets/{petId}/vaccinations  (VaccinationController::indexForClinic)
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Syringe, Plus, ChevronLeft, Edit2, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import ClinicLayout from '@/layouts/clinic-layout';

interface Vaccination { id: number; vaccine_name: string; date_administered?: string; next_due_date?: string; notes?: string; }

const getCsrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

export default function ClinicVaccinationsIndex() {
    const { petId } = usePage<{ props: { petId: string } }>().props;
    const [vaccs, setVaccs] = useState<Vaccination[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/clinic/pets/${petId}/vaccinations`, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' })
            .then(r => r.json()).then(j => { if (j.data) setVaccs(j.data); setLoading(false); });
    }, [petId]);

    const handleDelete = async (id: number) => {
        const r = await Swal.fire({ title: 'Delete vaccination?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (!r.isConfirmed) return;
        await fetch(`/api/clinic/pets/${petId}/vaccinations/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': getCsrf(), 'Accept': 'application/json' }, credentials: 'same-origin' });
        setVaccs(p => p.filter(v => v.id !== id));
    };

    return (
        <ClinicLayout>
            <Head title="Vaccinations — Clinic" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <Link href={route('clinic.pets.show', petId)} className="inline-flex items-center gap-1 text-blue-100 hover:text-white text-sm font-semibold mb-3"><ChevronLeft className="w-4 h-4" /> Back to Pet</Link>
                            <h1 className="text-2xl font-black flex items-center gap-2"><Syringe className="w-6 h-6" /> Vaccinations</h1>
                        </div>
                        <Link href={route('clinic.pets.vaccinations.create', petId)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all"><Plus className="w-4 h-4" /> Add</Link>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-300" /></div>
                    : vaccs.length === 0 ? (
                        <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Syringe className="w-10 h-10 text-blue-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">No vaccinations recorded</p>
                            <Link href={route('clinic.pets.vaccinations.create', petId)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold mt-4 hover:bg-blue-600 transition-colors"><Plus className="w-3.5 h-3.5" /> Add Vaccination</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {vaccs.map(v => (
                                <div key={v.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Syringe className="w-5 h-5 text-blue-400" /></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{v.vaccine_name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Administered: {v.date_administered ?? '—'} · Next due: {v.next_due_date ?? '—'}</p>
                                        {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Link href={route('clinic.pets.vaccinations.edit', { petId, id: v.id })} className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDelete(v.id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClinicLayout>
    );
}
