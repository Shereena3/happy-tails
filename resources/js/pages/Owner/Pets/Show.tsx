// resources/js/pages/Owner/Pets/Show.tsx
// API: GET /api/owner/pets/{id}  (includes health_summary + upcoming_reminders)

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    PawPrint, ChevronLeft, Edit2, Syringe, Pill,
    Scissors, Clock, Plus, Loader2, AlertCircle,
    Calendar, Activity, Trash2,
} from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { petService, vaccinationService, medicineService, groomingService } from '@/services/happy-tails';
import type { Pet, Vaccination, Medicine, GroomingSession } from '@/services/happy-tails/types';

type TabKey = 'vaccinations' | 'medicines' | 'grooming' | 'reminders';

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3`}>
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

export default function PetShow() {
    const { petId } = usePage<{ props: { petId: string } }>().props;
    const [pet,      setPet]      = useState<Pet | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [tab,      setTab]      = useState<TabKey>('vaccinations');
    const [vaccs,    setVaccs]    = useState<Vaccination[]>([]);
    const [meds,     setMeds]     = useState<Medicine[]>([]);
    const [grooms,   setGrooms]   = useState<GroomingSession[]>([]);
    const [tabLoad,  setTabLoad]  = useState(false);

    useEffect(() => {
        petService.getPet(Number(petId)).then(res => {
            if (res.success && res.data) setPet(res.data);
            setLoading(false);
        });
    }, [petId]);

    useEffect(() => {
        if (!pet) return;
        setTabLoad(true);
        const id = pet.id;
        if (tab === 'vaccinations') vaccinationService.getVaccinations(id).then(r => { if (r.data) setVaccs(r.data); setTabLoad(false); });
        else if (tab === 'medicines') medicineService.getMedicines(id).then(r => { if (r.data) setMeds(r.data); setTabLoad(false); });
        else if (tab === 'grooming') groomingService.getSessions(id).then(r => { if (r.data) setGrooms(r.data); setTabLoad(false); });
        else setTabLoad(false);
    }, [tab, pet]);

    const deleteVacc = async (id: number) => {
        if (!pet) return;
        const r = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (r.isConfirmed) { await vaccinationService.deleteVaccination(pet.id, id); setVaccs(p => p.filter(v => v.id !== id)); }
    };
    const deleteMed = async (id: number) => {
        if (!pet) return;
        const r = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (r.isConfirmed) { await medicineService.deleteMedicine(pet.id, id); setMeds(p => p.filter(m => m.id !== id)); }
    };
    const deleteGroom = async (id: number) => {
        if (!pet) return;
        const r = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
        if (r.isConfirmed) { await groomingService.deleteSession(pet.id, id); setGrooms(p => p.filter(g => g.id !== id)); }
    };

    const TABS: { key: TabKey; label: string; icon: any; color: string }[] = [
        { key: 'vaccinations', label: 'Vaccinations', icon: Syringe,  color: 'text-blue-600  border-blue-500  bg-blue-50'   },
        { key: 'medicines',    label: 'Medicines',    icon: Pill,     color: 'text-green-600 border-green-500 bg-green-50'  },
        { key: 'grooming',     label: 'Grooming',     icon: Scissors, color: 'text-pink-600  border-pink-500  bg-pink-50'   },
        { key: 'reminders',    label: 'Reminders',    icon: Clock,    color: 'text-amber-600 border-amber-500 bg-amber-50'  },
    ];

    if (loading) return <OwnerLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-orange-300" /></div></OwnerLayout>;
    if (!pet)   return <OwnerLayout><div className="flex items-center justify-center min-h-screen text-gray-500">Pet not found</div></OwnerLayout>;

    const hs = (pet as any).health_summary ?? {};

    return (
        <OwnerLayout>
            <Head title={`${pet.name} — Happy Tails`} />
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.pets.index')} className="inline-flex items-center gap-1.5 text-orange-100 hover:text-white text-sm font-semibold mb-4">
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
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-black">{pet.name}</h1>
                                <p className="text-orange-100 text-sm mt-0.5 capitalize">
                                    {pet.species} · {pet.breed ?? 'Unknown'} · {pet.sex ?? '—'} · {pet.age_string}
                                </p>
                            </div>
                            <Link href={route('owner.pets.edit', pet.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold border border-white/20 transition-colors shrink-0">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    {/* Health Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <SummaryCard label="Vaccinations"    value={hs.vaccinations ?? 0}      icon={Syringe}  color="bg-blue-500"   />
                        <SummaryCard label="Medicines"       value={hs.medicines ?? 0}          icon={Pill}     color="bg-green-500"  />
                        <SummaryCard label="Grooming"        value={hs.grooming_sessions ?? 0}  icon={Scissors} color="bg-pink-500"   />
                        <SummaryCard label="Pending Remind." value={hs.pending_reminders ?? 0}  icon={Clock}    color="bg-amber-500"  />
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-100 overflow-x-auto">
                            {TABS.map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                                        tab === t.key ? t.color : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                    }`}>
                                    <t.icon className="w-4 h-4" />{t.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-5">
                            {/* Add button row */}
                            <div className="flex justify-end mb-4">
                                {tab === 'vaccinations' && (
                                    <Link href={route('owner.pets.vaccinations.create', pet.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Vaccination
                                    </Link>
                                )}
                                {tab === 'medicines' && (
                                    <Link href={route('owner.pets.medicines.create', pet.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Medicine
                                    </Link>
                                )}
                                {tab === 'grooming' && (
                                    <Link href={route('owner.pets.grooming.create', pet.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Log Session
                                    </Link>
                                )}
                                {tab === 'reminders' && (
                                    <Link href={route('owner.reminders.create')}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Reminder
                                    </Link>
                                )}
                            </div>

                            {tabLoad ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
                            ) : (
                                <>
                                    {/* Vaccinations */}
                                    {tab === 'vaccinations' && (
                                        vaccs.length === 0 ? <EmptyTab label="No vaccinations recorded" /> :
                                        <div className="space-y-2">
                                            {vaccs.map(v => (
                                                <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                                    <Syringe className="w-5 h-5 text-blue-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{v.vaccine_name}</p>
                                                        <p className="text-xs text-gray-400">Given: {v.date_administered ?? '—'} · Due: {v.next_due_date ?? '—'}</p>
                                                        {v.notes && <p className="text-xs text-gray-500 mt-0.5">{v.notes}</p>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={route('owner.pets.vaccinations.edit', { petId: pet.id, id: v.id })} className="p-2 rounded-lg bg-white hover:bg-blue-100 text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></Link>
                                                        <button onClick={() => deleteVacc(v.id)} className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Medicines */}
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
                                                        <Link href={route('owner.pets.medicines.edit', { petId: pet.id, id: m.id })} className="p-2 rounded-lg bg-white hover:bg-green-100 text-green-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></Link>
                                                        <button onClick={() => deleteMed(m.id)} className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Grooming */}
                                    {tab === 'grooming' && (
                                        grooms.length === 0 ? <EmptyTab label="No grooming sessions recorded" /> :
                                        <div className="space-y-2">
                                            {grooms.map(g => (
                                                <div key={g.id} className="flex items-center gap-4 p-4 rounded-xl bg-pink-50 border border-pink-100">
                                                    <Scissors className="w-5 h-5 text-pink-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{g.service_type ?? 'Grooming'}</p>
                                                        <p className="text-xs text-gray-400">{g.date}</p>
                                                        {g.notes && <p className="text-xs text-gray-500 mt-0.5">{g.notes}</p>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={route('owner.pets.grooming.edit', { petId: pet.id, id: g.id })} className="p-2 rounded-lg bg-white hover:bg-pink-100 text-pink-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></Link>
                                                        <button onClick={() => deleteGroom(g.id)} className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reminders */}
                                    {tab === 'reminders' && (
                                        !(pet as any).upcoming_reminders?.length ? <EmptyTab label="No upcoming reminders" /> :
                                        <div className="space-y-2">
                                            {((pet as any).upcoming_reminders ?? []).map((r: any) => (
                                                <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                                                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{r.title}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{r.type} · {new Date(r.remind_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                    <Link href={route('owner.reminders.edit', r.id)} className="p-2 rounded-lg bg-white hover:bg-amber-100 text-amber-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></Link>
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
        </OwnerLayout>
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
