// resources/js/pages/Owner/Reminders/Edit.tsx
// API: PUT /api/owner/reminders/{id}

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Clock, ChevronLeft, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { reminderService } from '@/services/happy-tails';

const TYPES = [
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'medicine',    label: 'Medicine'    },
    { value: 'grooming',    label: 'Grooming'    },
    { value: 'vet_visit',   label: 'Vet Visit'   },
    { value: 'other',       label: 'Other'       },
];

export default function ReminderEdit() {
    const { reminderId } = usePage<{ props: { reminderId: string } }>().props;
    const [form,    setForm]    = useState({ type: 'other', title: '', notes: '', remind_at: '', is_done: false });
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [errors,  setErrors]  = useState<Record<string, string>>({});

    useEffect(() => {
        reminderService.getReminder(Number(reminderId)).then(r => {
            if (r.success && r.data) {
                const rem = r.data;
                // Format datetime-local value
                const dt = new Date(rem.remind_at);
                const local = dt.getFullYear() + '-' +
                    String(dt.getMonth() + 1).padStart(2, '0') + '-' +
                    String(dt.getDate()).padStart(2, '0') + 'T' +
                    String(dt.getHours()).padStart(2, '0') + ':' +
                    String(dt.getMinutes()).padStart(2, '0');
                setForm({ type: rem.type, title: rem.title, notes: rem.notes ?? '', remind_at: local, is_done: rem.is_done });
            }
            setLoading(false);
        });
    }, [reminderId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await reminderService.updateReminder(Number(reminderId), {
            type:      form.type as any,
            title:     form.title,
            notes:     form.notes || undefined,
            remind_at: form.remind_at,
            is_done:   form.is_done,
        });
        setSaving(false);
        if (res.success) {
            Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
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

    if (loading) return (
        <OwnerLayout>
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
            </div>
        </OwnerLayout>
    );

    return (
        <OwnerLayout>
            <Head title="Edit Reminder — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.reminders.index')} className="inline-flex items-center gap-1.5 text-amber-100 hover:text-white text-sm font-semibold mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Reminders
                        </Link>
                        <h1 className="text-2xl font-black">Edit Reminder</h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Type</label>
                                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={f('type')}>
                                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input type="text" value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    className={f('title')} />
                                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                            </div>

                            {/* Remind At */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Remind At <span className="text-red-500">*</span>
                                </label>
                                <input type="datetime-local" value={form.remind_at}
                                    onChange={e => setForm(p => ({ ...p, remind_at: e.target.value }))}
                                    className={f('remind_at')} />
                                {errors.remind_at && <p className="text-red-500 text-xs mt-1">{errors.remind_at}</p>}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                                <textarea rows={3} value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                    className={`${f('notes')} resize-none`} />
                            </div>

                            {/* Mark done toggle */}
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.is_done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                                    onClick={() => setForm(p => ({ ...p, is_done: !p.is_done }))}>
                                    {form.is_done && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Mark as done</span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <Link href={route('owner.reminders.index')}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                Cancel
                            </Link>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </OwnerLayout>
    );
}
