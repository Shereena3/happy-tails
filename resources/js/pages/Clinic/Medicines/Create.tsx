// resources/js/pages/Clinic/Medicines/Create.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Pill, ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import ClinicLayout from '@/layouts/clinic-layout';

const getCsrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

export default function ClinicMedicineCreate() {
    const { petId } = usePage<{ props: { petId: string } }>().props;
    const [form, setForm] = useState({ medicine_name: '', dosage: '', start_date: '', end_date: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.medicine_name.trim()) { setErrors({ medicine_name: 'Medicine name is required.' }); return; }
        setSaving(true);
        const res = await fetch(`/api/clinic/pets/${petId}/medicines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin', body: JSON.stringify(form),
        });
        const json = await res.json();
        setSaving(false);
        if (json.success) {
            Swal.fire({ title: 'Medicine Added!', icon: 'success', timer: 1500, showConfirmButton: false });
            window.location.href = route('clinic.pets.show', petId);
        } else {
            if (json.errors) { const m: any = {}; Object.entries(json.errors).forEach(([k, v]) => { m[k] = Array.isArray(v) ? (v as string[])[0] : String(v); }); setErrors(m); }
            else Swal.fire({ title: 'Error', text: json.message, icon: 'error' });
        }
    };

    const f = (field: string) => `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors border-gray-200 bg-gray-50 hover:border-green-300 focus:ring-green-400 ${errors[field] ? '!border-red-400 !bg-red-50' : ''}`;

    return (
        <ClinicLayout>
            <Head title="Add Medicine — Clinic" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('clinic.pets.show', petId)} className="inline-flex items-center gap-1 text-green-100 hover:text-white text-sm font-semibold mb-4"><ChevronLeft className="w-4 h-4" /> Back</Link>
                        <h1 className="text-2xl font-black flex items-center gap-2"><Pill className="w-6 h-6" /> Add Medicine</h1>
                    </div>
                </div>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Medicine Name <span className="text-red-500">*</span></label>
                                <input type="text" value={form.medicine_name} onChange={e => setForm(p => ({ ...p, medicine_name: e.target.value }))} placeholder="e.g. Amoxicillin" className={f('medicine_name')} />
                                {errors.medicine_name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.medicine_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Dosage</label>
                                <input type="text" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g. 250mg twice daily" className={f('dosage')} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className={f('start_date')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className={f('end_date')} />
                                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                                <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${f('notes')} resize-none`} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link href={route('clinic.pets.show', petId)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</Link>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving…' : 'Save Medicine'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ClinicLayout>
    );
}
