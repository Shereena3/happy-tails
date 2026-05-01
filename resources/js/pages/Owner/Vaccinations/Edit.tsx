// resources/js/pages/Owner/Vaccinations/Edit.tsx
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Syringe, ChevronLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { vaccinationService } from '@/services/happy-tails';

const today = new Date().toISOString().split('T')[0];

export default function VaccinationEdit() {
    const { petId, vaccinationId } = usePage<{ props: { petId: string; vaccinationId: string } }>().props;
    const [form,    setForm]    = useState({ vaccine_name: '', date_administered: '', next_due_date: '', notes: '' });
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [errors,  setErrors]  = useState<Record<string, string>>({});

    useEffect(() => {
        vaccinationService.getVaccination(Number(petId), Number(vaccinationId)).then(r => {
            if (r.success && r.data) {
                const v = r.data;
                setForm({ vaccine_name: v.vaccine_name, date_administered: v.date_administered ?? '', next_due_date: v.next_due_date ?? '', notes: v.notes ?? '' });
            }
            setLoading(false);
        });
    }, [petId, vaccinationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await vaccinationService.updateVaccination(Number(petId), Number(vaccinationId), form);
        setSaving(false);
        if (res.success) {
            Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
            router.visit(route('owner.pets.show', petId));
        } else {
            if (res.errors) { const m: any = {}; Object.entries(res.errors).forEach(([k, v]) => { m[k] = Array.isArray(v) ? v[0] : String(v); }); setErrors(m); }
            else Swal.fire({ title: 'Error', text: res.message, icon: 'error' });
        }
    };

    const f = (field: string) => `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors border-gray-200 bg-gray-50 hover:border-blue-300 focus:ring-blue-400 ${errors[field] ? '!border-red-400 !bg-red-50' : ''}`;

    if (loading) return <OwnerLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-300" /></div></OwnerLayout>;

    return (
        <OwnerLayout>
            <Head title="Edit Vaccination — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.pets.show', petId)} className="inline-flex items-center gap-1 text-blue-100 hover:text-white text-sm font-semibold mb-4"><ChevronLeft className="w-4 h-4" /> Back</Link>
                        <h1 className="text-2xl font-black">Edit Vaccination</h1>
                    </div>
                </div>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Vaccine Name <span className="text-red-500">*</span></label>
                                <input type="text" value={form.vaccine_name} onChange={e => setForm(p => ({ ...p, vaccine_name: e.target.value }))} className={f('vaccine_name')} />
                                {errors.vaccine_name && <p className="text-red-500 text-xs mt-1">{errors.vaccine_name}</p>}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Date Administered</label>
                                    <input type="date" value={form.date_administered} max={today} onChange={e => setForm(p => ({ ...p, date_administered: e.target.value }))} className={f('date_administered')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Next Due Date</label>
                                    <input type="date" value={form.next_due_date} onChange={e => setForm(p => ({ ...p, next_due_date: e.target.value }))} className={f('next_due_date')} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Notes</label>
                                <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${f('notes')} resize-none`} />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link href={route('owner.pets.show', petId)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</Link>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors">
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
