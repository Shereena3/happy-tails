// resources/js/pages/Owner/Pets/Edit.tsx
// API: POST /api/owner/pets/{id} (_method=PUT)

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronLeft, Loader2, Save, Camera, X, PawPrint } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { petService } from '@/services/happy-tails';
import type { Pet } from '@/services/happy-tails/types';

const SPECIES = ['dog', 'cat'] as const;
const SEX_OPTIONS = ['male', 'female'] as const;

export default function PetEdit() {
    const { petId } = usePage<{ props: { petId: string } }>().props;
    const [pet,    setPet]    = useState<Pet | null>(null);
    const [loading,setLoading]= useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [photo,  setPhoto]  = useState<File | null>(null);
    const [preview,setPreview]= useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [photoErr, setPhotoErr] = useState('');
    const [form, setForm] = useState({ name: '', species: 'dog', breed: '', sex: '', birthday: '' });

    useEffect(() => {
        petService.getPet(Number(petId)).then(res => {
            if (res.success && res.data) {
                const p = res.data;
                setPet(p);
                setForm({ name: p.name, species: p.species, breed: p.breed ?? '', sex: p.sex ?? '', birthday: p.birthday ?? '' });
            }
            setLoading(false);
        });
    }, [petId]);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setPhotoErr('');
        if (!f) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { setPhotoErr('Only JPG, PNG, or WEBP.'); return; }
        if (f.size > 3 * 1024 * 1024) { setPhotoErr('Max 3 MB.'); return; }
        setPhoto(f); setRemovePhoto(false); setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await petService.updatePet(Number(petId), {
            ...form,
            photo: photo ?? undefined,
            remove_photo: removePhoto,
        });
        setSaving(false);
        if (res.success) {
            await Swal.fire({ title: 'Pet Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
            router.visit(route('owner.pets.show', petId));
        } else {
            if (res.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(res.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v); });
                setErrors(mapped);
            } else {
                Swal.fire({ title: 'Error', text: res.message, icon: 'error' });
            }
        }
    };

    const f = (field: string) => `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors border-gray-200 bg-gray-50 hover:border-orange-300 focus:ring-orange-400 ${errors[field] ? '!border-red-400 !bg-red-50' : ''}`;
    const displayPhoto = preview ?? (removePhoto ? null : pet?.photo_url);

    if (loading) return <OwnerLayout><div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-orange-300" /></div></OwnerLayout>;

    return (
        <OwnerLayout>
            <Head title={`Edit ${pet?.name ?? 'Pet'} — Happy Tails`} />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.pets.show', petId)} className="inline-flex items-center gap-1.5 text-orange-100 hover:text-white text-sm font-semibold mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to {pet?.name}
                        </Link>
                        <h1 className="text-2xl font-black">Edit {pet?.name}</h1>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Photo */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3">
                            <div className="relative">
                                {displayPhoto ? (
                                    <img src={displayPhoto} alt={pet?.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                ) : (
                                    <div className="w-28 h-28 rounded-2xl bg-orange-50 flex items-center justify-center border-4 border-white shadow-lg">
                                        <PawPrint className="w-10 h-10 text-orange-200" />
                                    </div>
                                )}
                                <button type="button" onClick={() => document.getElementById('pet-photo')?.click()}
                                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md">
                                    <Camera className="w-4 h-4" />
                                </button>
                                {displayPhoto && (
                                    <button type="button" onClick={() => { setPhoto(null); setPreview(null); setRemovePhoto(true); }}
                                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <input id="pet-photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
                            {photoErr && <p className="text-red-500 text-xs">{photoErr}</p>}
                        </div>

                        {/* Fields */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Pet name" className={f('name')} />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Species</label>
                                    <select value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))} className={f('species')}>
                                        {SPECIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Sex</label>
                                    <select value={form.sex} onChange={e => setForm(p => ({ ...p, sex: e.target.value }))} className={f('sex')}>
                                        <option value="">Unknown</option>
                                        {SEX_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Breed</label>
                                    <input type="text" value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))} placeholder="e.g. Labrador" className={f('breed')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Birthday</label>
                                    <input type="date" value={form.birthday} max={new Date().toISOString().split('T')[0]} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} className={f('birthday')} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href={route('owner.pets.show', petId)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</Link>
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors">
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
