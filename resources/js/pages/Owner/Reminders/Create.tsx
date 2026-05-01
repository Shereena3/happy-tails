// resources/js/pages/Owner/Reminders/Create.tsx
// API: POST /api/owner/reminders

import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Clock, ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { reminderService, petService } from '@/services/happy-tails';
import type { Pet } from '@/services/happy-tails/types';

const TYPES = [
    { value: 'vaccination', label: 'Vaccination'  },
    { value: 'medicine',    label: 'Medicine'      },
    { value: 'grooming',    label: 'Grooming'      },
    { value: 'vet_visit',   label: 'Vet Visit'     },
    { value: 'other',       label: 'Other'         },
];

export default function ReminderCreate() {
    const [pets,   setPets]   = useState<Pet[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form,   setForm]   = useState({
        pet_id:    '',
        type:      'other',
        title:     '',
        notes:     '',
        remind_at: '',
    });

    useEffect(() => {
        petService.getActivePets().then(r => { if (r.data) setPets(r.data); });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.pet_id) { setErrors(p => ({ ...p, pet_id: 'Please select a pet.' })); return; }
        setSaving(true);
        const res = await reminderService.createReminder({
            pet_id:    Number(form.pet_id),
            type:      form.type as any,
            title:     form.title,
            notes:     form.notes || undefined,
            remind_at: form.remind_at,
        });
        setSaving(false);
        if (res.success) {
            Swal.fire({ title: 'Reminder Set!', icon: 'success', timer: 1500, showConfirmButton: false });
            router.visit(route('owner.reminders.index'));
        } else {
            if (res.errors) {
                const m: Record<string, string> = {};
                Object.entries(res.errors).forEach(([k, v]) => { m[k] = Array.isArray(v) ? v[0] : String(v); });
                setErrors(m);
            } else {
                Swal.fire({ title: 'Error', text: res.message, icon: 'error' });
            }
        }
    };

    const f = (field: string) =>
        `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors border-gray-200 bg-gray-50 hover:border-amber-300 focus:ring-amber-400 ${errors[field] ? '!border-red-400 !bg-red-50' : ''}`;

    return (
        <OwnerLayout>
            <Head title="Add Reminder — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.reminders.index')} className="inline-flex items-center gap-1.5 text-amber-100 hover:text-white text-sm font-semibold mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Reminders
                        </Link>
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <Clock className="w-6 h-6" /> Add Reminder
                        </h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

                            {/* Pet */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Pet <span className="text-red-500">*</span>
                                </label>
                                <select value={form.pet_id} onChange={e => { setForm(p => ({ ...p, pet_id: e.target.value })); setErrors(p => { const x = { ...p }; delete x.pet_id; return x; }); }}
                                    className={f('pet_id')}>
                                    <option value="">Select a pet…</option>
                                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                                </select>
                                {errors.pet_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pet_id}</p>}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
                                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                    className={f('type')}>
                                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={form.title}
                                    onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => { const x = { ...p }; delete x.title; return x; }); }}
                                    placeholder="e.g. Annual rabies shot due"
                                    className={f('title')} />
                                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                            </div>

                            {/* Remind At */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Remind At <span className="text-red-500">*</span>
                                </label>
                                <input type="datetime-local" value={form.remind_at}
                                    onChange={e => { setForm(p => ({ ...p, remind_at: e.target.value })); setErrors(p => { const x = { ...p }; delete x.remind_at; return x; }); }}
                                    className={f('remind_at')} />
                                {errors.remind_at && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.remind_at}</p>}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                                <textarea rows={3} value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Any additional info…"
                                    className={`${f('notes')} resize-none`} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href={route('owner.reminders.index')}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                Cancel
                            </Link>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors shadow-sm">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving…' : 'Set Reminder'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </OwnerLayout>
    );
}
