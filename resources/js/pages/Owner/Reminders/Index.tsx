// resources/js/pages/Owner/Reminders/Index.tsx
// API: GET /api/owner/reminders

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Clock, Plus, Edit2, Trash2, Loader2,
    CheckCircle, Filter, Search, AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { reminderService } from '@/services/happy-tails';
import type { Reminder } from '@/services/happy-tails/types';

const TYPE_COLOR: Record<string, string> = {
    vaccination: 'bg-blue-100 text-blue-700 border-blue-200',
    medicine:    'bg-green-100 text-green-700 border-green-200',
    grooming:    'bg-pink-100 text-pink-700 border-pink-200',
    vet_visit:   'bg-purple-100 text-purple-700 border-purple-200',
    other:       'bg-gray-100 text-gray-600 border-gray-200',
};

const FILTERS = [
    { label: 'All',       value: ''         },
    { label: 'Upcoming',  value: 'upcoming' },
    { label: 'Overdue',   value: 'overdue'  },
    { label: 'Due Soon',  value: 'due_soon' },
    { label: 'Done',      value: 'done'     },
];

export default function RemindersIndex() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [filter,    setFilter]    = useState('');
    const [search,    setSearch]    = useState('');
    const [marking,   setMarking]   = useState<number | null>(null);

    const load = async (f = filter) => {
        setLoading(true);
        const res = await reminderService.getReminders({ filter: f as any || undefined });
        if (res.success && res.data) setReminders(res.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { load(filter); }, [filter]);

    const handleMarkDone = async (id: number) => {
        setMarking(id);
        const res = await reminderService.markDone(id);
        if (res.success && res.data) {
            setReminders(p => p.map(r => r.id === id ? { ...r, is_done: true } : r));
        }
        setMarking(null);
    };

    const handleDelete = async (id: number) => {
        const r = await Swal.fire({
            title: 'Delete reminder?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', confirmButtonText: 'Delete',
        });
        if (r.isConfirmed) {
            await reminderService.deleteReminder(id);
            setReminders(p => p.filter(r => r.id !== id));
        }
    };

    const filtered = reminders.filter(r =>
        !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.pet?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const isOverdue = (r: Reminder) => !r.is_done && new Date(r.remind_at) < new Date();

    return (
        <OwnerLayout>
            <Head title="Reminders — Happy Tails" />
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-black flex items-center gap-2">
                                <Clock className="w-6 h-6" /> Reminders
                            </h1>
                            <p className="text-amber-100 text-sm mt-1">All reminders across your pets</p>
                        </div>
                        <Link href={route('owner.reminders.create')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 rounded-xl font-black text-sm hover:shadow-xl hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Add Reminder
                        </Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

                    {/* Search + Filter */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search reminders or pet name…"
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
                            <Clock className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No reminders found</p>
                            <Link href={route('owner.reminders.create')}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-black hover:bg-amber-600 transition-colors mt-4">
                                <Plus className="w-4 h-4" /> Add Reminder
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(r => (
                                <div key={r.id}
                                    className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 transition-all ${
                                        r.is_done
                                            ? 'border-gray-100 opacity-60'
                                            : isOverdue(r)
                                                ? 'border-red-200 bg-red-50/30'
                                                : 'border-gray-100'
                                    }`}>

                                    {/* Status icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${r.is_done ? 'bg-green-50' : isOverdue(r) ? 'bg-red-50' : 'bg-amber-50'}`}>
                                        {r.is_done
                                            ? <CheckCircle className="w-5 h-5 text-green-400" />
                                            : isOverdue(r)
                                                ? <AlertCircle className="w-5 h-5 text-red-400" />
                                                : <Clock className="w-5 h-5 text-amber-400" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 flex-wrap">
                                            <p className={`text-sm font-bold ${r.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                {r.title}
                                            </p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${TYPE_COLOR[r.type] ?? TYPE_COLOR.other}`}>
                                                {r.type.replace('_', ' ')}
                                            </span>
                                            {isOverdue(r) && !r.is_done && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {r.pet?.name && <span className="font-semibold text-gray-500">{r.pet.name} · </span>}
                                            {new Date(r.remind_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!r.is_done && (
                                            <button onClick={() => handleMarkDone(r.id)} disabled={marking === r.id}
                                                className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-500 transition-colors"
                                                title="Mark done">
                                                {marking === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <Link href={route('owner.reminders.edit', r.id)}
                                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-500 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(r.id)}
                                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
