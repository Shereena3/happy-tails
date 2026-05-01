// resources/js/pages/Clinic/Pets/Show.tsx
// API: GET /api/clinic/pets/{petId}  (PetController::showForClinic)
// Clinic can view + add/edit/delete vaccinations, medicines, grooming via /api/clinic/pets/{petId}/...

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    PawPrint, ChevronLeft, Syringe, Pill, Scissors,
    Clock, Plus, Loader2, AlertCircle, Edit2, Trash2, Users,
} from 'lucide-react';
import Swal from 'sweetalert2';
import ClinicLayout from '@/layouts/clinic-layout';
import { vaccinationService, medicineService, groomingService } from '@/services/happy-tails';
import type { Vaccination, Medicine, GroomingSession } from '@/services/happy-tails/types';

interface Pet {
    id: number; name: string; species: string; breed?: string;
    sex?: string; age_string?: string; photo_url?: string; is_active: boolean;
    birthday?: string;
    owner?: { id: number; name?: string; first_name: string; last_name: string };
    health_summary?: {
        vaccinations: number; medicines: number;
        grooming_sessions: number; pending_reminders: number;
        last_vaccination?: string; last_grooming?: string;
    };
}

type TabKey = 'vaccinations' | 'medicines' | 'grooming';

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
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
}

export default function ClinicPetShow() {
    const { id } = usePage<{ props: { id: string } }>().props;
    const [pet,     setPet]     = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab,     setTab]     = useState<TabKey>('vaccinations');
    const [vaccs,   setVaccs]   = useState<Vaccination[]>([]);
    const [meds,    setMeds]    = useState<Medicine[]>([]);
    const [grooms,  setGrooms]  = useState<GroomingSession[]>([]);
    const [tabLoad, setTabLoad] = useState(false);

   useEffect(() => {
    setLoading(true);

    fetch(`/api/clinic/pets/${id}`, {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    })
    .then(r => r.json())
    .then(json => {
        if (json.success && json.data) {
            setPet(json.data);
        } else {
            setPet(null);
        }
    })
    .catch(() => {
        setPet(null);
    })
    .finally(() => {
        setLoading(false);
    });

}, [id]);

    useEffect(() => {
        if (!pet) return;
        setTabLoad(true);
        const id = pet.id;
        // Use clinic-scoped fetch wrappers (BaseService uses same-origin credentials)
        if (tab === 'vaccinations') {
            fetch(`/api/clinic/pets/${id}/vaccinations`, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' })
                .then(r => r.json()).then(j => { if (j.data) setVaccs(j.data); setTabLoad(false); });
        } else if (tab === 'medicines') {
            fetch(`/api/clinic/pets/${id}/medicines`, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' })
                .then(r => r.json()).then(j => { if (j.data) setMeds(j.data); setTabLoad(false); });
        } else {
            fetch(`/api/clinic/pets/${id}/grooming`, { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' })
                .then(r => r.json()).then(j => { if (j.data) setGrooms(j.data); setTabLoad(false); });
        }
    }, [tab, pet]);

    const getCsrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    const deleteVacc = async (id: number) => {
        const r = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (!r.isConfirmed || !pet) return;
        await fetch(`/api/clinic/pets/${pet.id}/vaccinations/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': getCsrf(), 'Accept': 'application/json' }, credentials: 'same-origin' });
        setVaccs(p => p.filter(v => v.id !== id));
    };
    const deleteMed = async (id: number) => {
        const r = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (!r.isConfirmed || !pet) return;
        await fetch(`/api/clinic/pets/${pet.id}/medicines/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': getCsrf(), 'Accept': 'application/json' }, credentials: 'same-origin' });
        setMeds(p => p.filter(m => m.id !== id));
    };
    const deleteGroom = async (id: number) => {
        const r = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (!r.isConfirmed || !pet) return;
        await fetch(`/api/clinic/pets/${pet.id}/grooming/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': getCsrf(), 'Accept': 'application/json' }, credentials: 'same-origin' });
        setGrooms(p => p.filter(g => g.id !== id));
    };

    const TABS = [
        { key: 'vaccinations' as TabKey, label: 'Vaccinations', icon: Syringe,  on: 'border-blue-500 text-blue-600 bg-blue-50',   off: 'border-transparent text-gray-400 hover:bg-gray-50' },
        { key: 'medicines'    as TabKey, label: 'Medicines',    icon: Pill,     on: 'border-green-500 text-green-600 bg-green-50', off: 'border-transparent text-gray-400 hover:bg-gray-50' },
        { key: 'grooming'     as TabKey, label: 'Grooming',     icon: Scissors, on: 'border-pink-500 text-pink-600 bg-pink-50',    off: 'border-transparent text-gray-400 hover:bg-gray-50' },
    ];

    if (loading) return <ClinicLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-teal-300" /></div></ClinicLayout>;
    if (!pet)   return <ClinicLayout><div className="flex items-center justify-center min-h-screen text-gray-500">Pet not found</div></ClinicLayout>;

    const hs     = pet.health_summary ?? { vaccinations: 0, medicines: 0, grooming_sessions: 0, pending_reminders: 0 };
    const owner  = pet.owner;
    const ownerName = owner ? (owner.name ?? `${owner.first_name} ${owner.last_name}`) : null;

    return (
        <ClinicLayout>
            <Head title={`${pet.name} — Clinic`} />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('clinic.pets.index')} className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white text-sm font-semibold mb-4">
                            <ChevronLeft className="w-4 h-4" /> Back to Pets
                        </Link>
                        <div className="flex items-center gap-5">
                            {pet.photo_url ? (
                                <img src={pet.photo_url} alt={pet.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl shrink-0" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 shrink-0">
                                    <PawPrint className="w-9 h-9 text-white/70" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-black">{pet.name}</h1>
                                <p className="text-teal-100 text-sm mt-0.5 capitalize">
                                    {pet.species} · {pet.breed ?? '—'} · {pet.sex ?? '—'} · {pet.age_string}
                                </p>
                                {ownerName && owner && (
                                    <Link href={route('clinic.owners.show', owner.id)}
                                        className="inline-flex items-center gap-1 mt-1 text-teal-100 hover:text-white text-xs font-semibold transition-colors">
                                        <Users className="w-3 h-3" /> Owner: {ownerName}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    {/* Health summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <SummaryCard label="Vaccinations"    value={hs.vaccinations}      icon={Syringe}  color="bg-blue-500"   />
                        <SummaryCard label="Medicines"       value={hs.medicines}          icon={Pill}     color="bg-green-500"  />
                        <SummaryCard label="Grooming"        value={hs.grooming_sessions}  icon={Scissors} color="bg-pink-500"   />
                        <SummaryCard label="Pending Remind." value={hs.pending_reminders}  icon={Clock}    color="bg-amber-500"  />
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            {TABS.map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all ${tab === t.key ? t.on : t.off}`}>
                                    <t.icon className="w-4 h-4" />{t.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-5">
                            {/* Add button */}
                            <div className="flex justify-end mb-4">
                                {tab === 'vaccinations' && (
                                    <Link href={route('clinic.pets.vaccinations.create', pet.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Vaccination
                                    </Link>
                                )}
                                {tab === 'medicines' && (
                                    <Link href={route('clinic.pets.medicines.create', pet.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Medicine
                                    </Link>
                                )}
                                {tab === 'grooming' && (
                                    <Link href={route('clinic.pets.grooming.create', pet.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Log Session
                                    </Link>
                                )}
                            </div>

                            {tabLoad ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                            ) : (
                                <>
                                    {tab === 'vaccinations' && (
                                        vaccs.length === 0 ? <EmptyTab label="No vaccinations recorded" /> :
                                        <div className="space-y-2">
                                            {vaccs.map(v => (
                                                <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                                    <Syringe className="w-5 h-5 text-blue-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{v.vaccine_name}</p>
                                                        <p className="text-xs text-gray-400">Given: {v.date_administered ?? '—'} · Due: {v.next_due_date ?? '—'}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={route('clinic.pets.vaccinations.edit', { petId: pet.id, id: v.id })} className="p-2 rounded-lg bg-white hover:bg-blue-100 text-blue-500"><Edit2 className="w-3.5 h-3.5" /></Link>
                                                        <button onClick={() => deleteVacc(v.id)} className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {tab === 'medicines' && (
                                        meds.length === 0 ? <EmptyTab label="No medicines recorded" /> :
                                        <div className="space-y-2">
                                            {meds.map(m => (
                                                <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                                                    <Pill className="w-5 h-5 text-green-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{m.medicine_name}</p>
                                                        <p className="text-xs text-gray-400">{m.dosage ?? '—'} · {m.start_date ?? '—'} → {m.end_date ?? 'ongoing'}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={route('clinic.pets.medicines.edit', { petId: pet.id, id: m.id })} className="p-2 rounded-lg bg-white hover:bg-green-100 text-green-500"><Edit2 className="w-3.5 h-3.5" /></Link>
                                                        <button onClick={() => deleteMed(m.id)} className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {tab === 'grooming' && (
                                        grooms.length === 0 ? <EmptyTab label="No grooming sessions" /> :
                                        <div className="space-y-2">
                                            {grooms.map(g => (
                                                <div key={g.id} className="flex items-center gap-4 p-4 rounded-xl bg-pink-50 border border-pink-100">
                                                    <Scissors className="w-5 h-5 text-pink-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{g.service_type ?? 'Grooming'}</p>
                                                        <p className="text-xs text-gray-400">{g.date}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={route('clinic.pets.grooming.edit', { petId: pet.id, id: g.id })} className="p-2 rounded-lg bg-white hover:bg-pink-100 text-pink-500"><Edit2 className="w-3.5 h-3.5" /></Link>
                                                        <button onClick={() => deleteGroom(g.id)} className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ClinicLayout>
    );
}

function EmptyTab({ label }: { label: string }) {
    return (
        <div className="text-center py-10">
            <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-semibold">{label}</p>
        </div>
    );
}
