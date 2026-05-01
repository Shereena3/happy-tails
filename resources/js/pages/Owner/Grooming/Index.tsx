// resources/js/pages/Owner/Grooming/Index.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Scissors, Plus, ChevronLeft, Edit2, Trash2, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { groomingService } from '@/services/happy-tails';
import type { GroomingSession } from '@/services/happy-tails/types';

export default function GroomingIndex() {
    const { petId } = usePage<{ props: { petId: string } }>().props;
    const [sessions, setSessions] = useState<GroomingSession[]>([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        groomingService.getSessions(Number(petId)).then(r => { if (r.data) setSessions(r.data); setLoading(false); });
    }, [petId]);

    const handleDelete = async (id: number) => {
        const r = await Swal.fire({ title: 'Delete session?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (r.isConfirmed) { await groomingService.deleteSession(Number(petId), id); setSessions(p => p.filter(s => s.id !== id)); }
    };

    return (
        <OwnerLayout>
            <Head title="Grooming — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <Link href={route('owner.pets.show', petId)} className="inline-flex items-center gap-1 text-pink-100 hover:text-white text-sm font-semibold mb-3"><ChevronLeft className="w-4 h-4" /> Back</Link>
                            <h1 className="text-2xl font-black flex items-center gap-2"><Scissors className="w-6 h-6" /> Grooming</h1>
                        </div>
                        <Link href={route('owner.pets.grooming.create', petId)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-pink-600 rounded-xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Log Session
                        </Link>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-pink-300" /></div>
                    : sessions.length === 0 ? (
                        <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Scissors className="w-10 h-10 text-pink-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">No grooming sessions logged</p>
                            <Link href={route('owner.pets.grooming.create', petId)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-bold mt-4 hover:bg-pink-600 transition-colors"><Plus className="w-3.5 h-3.5" /> Log Session</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map(s => (
                                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0"><Scissors className="w-5 h-5 text-pink-400" /></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{s.service_type ?? 'Grooming Session'}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>
                                        {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Link href={route('owner.pets.grooming.edit', { petId, id: s.id })} className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-500 transition-colors"><Edit2 className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDelete(s.id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
