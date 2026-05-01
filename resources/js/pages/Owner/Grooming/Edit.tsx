// resources/js/pages/Owner/Grooming/Edit.tsx
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Scissors, ChevronLeft, Save, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { groomingService } from '@/services/happy-tails';

const SERVICE_TYPES = ['Bath', 'Haircut', 'Nail Trim', 'Ear Cleaning', 'Full Groom', 'Other'];

export default function GroomingEdit() {
    const { petId, sessionId } = usePage<{ props: { petId: string; sessionId: string } }>().props;
    const [form, setForm] = useState({ date: '', service_type: '', notes: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        groomingService.getSession(Number(petId), Number(sessionId)).then(r => {
            if (r.success && r.data) {
                const s = r.data;
                setForm({ date: s.date, service_type: s.service_type ?? '', notes: s.notes ?? '' });
            }
            setLoading(false);
        });
    }, [petId, sessionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await groomingService.updateSession(Number(petId), Number(sessionId), { ...form, service_type: form.service_type as any || undefined });
        setSaving(false);
        if (res.success) {
            Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
            router.visit(route('owner.pets.show', petId));
        } else {
            if (res.errors) { const m: any = {}; Object.entries(res.errors).forEach(([k, v]) => { m[k] = Array.isArray(v) ? v[0] : String(v); }); setErrors(m); }
            else Swal.fire({ title: 'Error', text: res.message, icon: 'error' });
        }
    };

    const f = (field: string) => `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors border-gray-200 bg-gray-50 hover:border-pink-300 focus:ring-pink-400 ${errors[field] ? '!border-red-400 !bg-red-50' : ''}`;

    if (loading) return <OwnerLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-pink-300" /></div></OwnerLayout>;

    return (
        <OwnerLayout>
            <Head title="Edit Grooming Session — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.pets.show', petId)} className="inline-flex items-center gap-1 text-pink-100 hover:text-white text-sm font-semibold mb-4"><ChevronLeft className="w-4 h-4" /> Back</Link>
                        <h1 className="text-2xl font-black">Edit Grooming Session</h1>
                    </div>
                </div>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={f('date')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Service Type</label>
                                    <select value={form.service_type} onChange={e => setForm(p => ({ ...p, service_type: e.target.value }))} className={f('service_type')}>
                                        <option value="">Select type…</option>
                                        {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                                <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${f('notes')} resize-none`} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link href={route('owner.pets.show', petId)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</Link>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors">
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
