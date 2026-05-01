// resources/js/pages/Clinic/Reminders/Index.tsx
// API: GET /api/clinic/reminders  (ReminderController::indexForClinic)
// Read-only — clinic can monitor but not create/edit reminders

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Clock, Loader2, Search, Filter, AlertCircle,
    CheckCircle, PawPrint, ChevronRight,
} from 'lucide-react';
import ClinicLayout from '@/layouts/clinic-layout';

interface Reminder {
    id: number; type: string; title: string; notes?: string;
    remind_at: string; is_done: boolean;
    pet?: { id: number; name: string; species: string; photo_url?: string;
            owner?: { id: number; name?: string; first_name: string; last_name: string } };
}

const TYPE_COLOR: Record<string, string> = {
    vaccination: 'bg-blue-100 text-blue-700 border-blue-200',
    medicine:    'bg-green-100 text-green-700 border-green-200',
    grooming:    'bg-pink-100 text-pink-700 border-pink-200',
    vet_visit:   'bg-purple-100 text-purple-700 border-purple-200',
    other:       'bg-gray-100 text-gray-600 border-gray-200',
};

const FILTERS = [
    { label: 'All Pending', value: ''         },
    { label: 'Overdue',     value: 'overdue'  },
    { label: 'Due Soon',    value: 'due_soon' },
    { label: 'Upcoming',    value: 'upcoming' },
    { label: 'Done',        value: 'done'     },
];

export default function ClinicRemindersIndex() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [filter,    setFilter]    = useState('');
    const [search,    setSearch]    = useState('');

    const load = async (f = '') => {
        setLoading(true);
        const qs = f ? `?filter=${f}` : '';
        const res = await fetch(`/api/clinic/reminders${qs}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });
        const json = await res.json();
        setReminders(json.success ? (json.data ?? []) : []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { load(filter); }, [filter]);

    const isOverdue = (r: Reminder) => !r.is_done && new Date(r.remind_at) < new Date();

    const filtered = reminders.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            r.title.toLowerCase().includes(q) ||
            r.pet?.name?.toLowerCase().includes(q) ||
            (r.pet?.owner?.name ?? `${r.pet?.owner?.first_name} ${r.pet?.owner?.last_name}`)?.toLowerCase().includes(q)
        );
    });

    const overdueCount = reminders.filter(r => isOverdue(r)).length;

    return (
        <ClinicLayout>
            <Head title="Reminders — Clinic" />
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-2xl font-black flex items-center gap-2">
                                    <Clock className="w-6 h-6" /> Pet Reminders
                                </h1>
                                <p className="text-amber-100 text-sm mt-1">
                                    Monitoring all pending reminders across registered pets
                                </p>
                            </div>
                            {overdueCount > 0 && (
                                <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-2xl px-4 py-2.5">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                    <span className="text-white font-black text-sm">{overdueCount} overdue</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                    {/* Search + Filters */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by pet, owner, or reminder title…"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-amber-300 transition-colors" />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                {FILTERS.map(f => (
                                    <button key={f.value} onClick={() => setFilter(f.value)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                                            filter === f.value
                                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                                : 'border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600'
                                        }`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <CheckCircle className="w-12 h-12 text-teal-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No reminders found</p>
                            <p className="text-gray-400 text-xs mt-1">
                                {filter === 'overdue' ? 'No overdue reminders — all pets are up to date!' : 'Try adjusting your filter or search.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(r => {
                                const over = isOverdue(r);
                                const ownerName = r.pet?.owner
                                    ? (r.pet.owner.name ?? `${r.pet.owner.first_name} ${r.pet.owner.last_name}`)
                                    : null;

                                return (
                                    <div key={r.id}
                                        className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 transition-all ${
                                            r.is_done   ? 'border-gray-100 opacity-60'
                                            : over      ? 'border-red-200 bg-red-50/20'
                                            : 'border-gray-100 hover:border-amber-200'
                                        }`}>

                                        {/* Status icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            r.is_done ? 'bg-green-50' : over ? 'bg-red-50' : 'bg-amber-50'
                                        }`}>
                                            {r.is_done
                                                ? <CheckCircle className="w-5 h-5 text-green-400" />
                                                : over
                                                    ? <AlertCircle className="w-5 h-5 text-red-400" />
                                                    : <Clock className="w-5 h-5 text-amber-400" />
                                            }
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-2 flex-wrap">
                                                <p className={`text-sm font-bold ${r.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                    {r.title}
                                                </p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ${TYPE_COLOR[r.type] ?? TYPE_COLOR.other}`}>
                                                    {r.type.replace('_', ' ')}
                                                </span>
                                                {over && !r.is_done && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>

                                            {/* Pet + owner info */}
                                            {r.pet && (
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {r.pet.photo_url ? (
                                                        <img src={r.pet.photo_url} alt={r.pet.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                            <PawPrint className="w-3 h-3 text-orange-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-semibold text-gray-700">{r.pet.name}</span>
                                                    <span className="text-gray-300 text-xs">·</span>
                                                    <span className="text-xs text-gray-400 capitalize">{r.pet.species}</span>
                                                    {ownerName && (
                                                        <>
                                                            <span className="text-gray-300 text-xs">·</span>
                                                            <span className="text-xs text-gray-400">Owner: {ownerName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(r.remind_at).toLocaleDateString('en-PH', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </p>

                                            {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                                        </div>

                                        {/* View pet link */}
                                        {r.pet && (
                                            <Link href={route('clinic.pets.show', r.pet.id)}
                                                className="flex items-center gap-1 text-xs font-bold text-teal-500 hover:text-teal-700 transition-colors shrink-0 mt-1">
                                                <PawPrint className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">View Pet</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && filtered.length > 0 && (
                        <p className="text-center text-xs text-gray-400 mt-4">
                            {filtered.length} reminder{filtered.length !== 1 ? 's' : ''} shown
                        </p>
                    )}
                </div>
            </div>
        </ClinicLayout>
    );
}
