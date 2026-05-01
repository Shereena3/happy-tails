// resources/js/pages/Owner/Pets/Create.tsx
// API: POST /api/owner/pets

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PawPrint, ChevronLeft, Camera, X, Loader2, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { petService } from '@/services/happy-tails';

const SPECIES = ['dog', 'cat'] as const;
const SEX_OPTIONS = ['male', 'female'] as const;

function PetForm({
    defaultValues = {},
    onSubmit,
    saving,
    errors,
    photoUrl,
}: {
    defaultValues?: any;
    onSubmit: (data: any, photo: File | null, removePhoto: boolean) => void;
    saving: boolean;
    errors: Record<string, string>;
    photoUrl?: string | null;
}) {
    const [form, setForm] = useState({
        name:     defaultValues.name     ?? '',
        species:  defaultValues.species  ?? 'dog',
        breed:    defaultValues.breed    ?? '',
        sex:      defaultValues.sex      ?? '',
        birthday: defaultValues.birthday ?? '',
    });
    const [photo,       setPhoto]       = useState<File | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [preview,     setPreview]     = useState<string | null>(null);
    const [photoErr,    setPhotoErr]    = useState('');

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setPhotoErr('');
        if (!f) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { setPhotoErr('Only JPG, PNG, or WEBP.'); return; }
        if (f.size > 3 * 1024 * 1024) { setPhotoErr('Max 3 MB.'); return; }
        setPhoto(f);
        setRemovePhoto(false);
        setPreview(URL.createObjectURL(f));
    };

    const f = (field: string) => `border-gray-200 bg-gray-50 hover:border-orange-300 focus:ring-orange-400 ${errors[field] ? '!border-red-400 !bg-red-50' : ''}`;

    const displayPhoto = preview ?? (removePhoto ? null : photoUrl);

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(form, photo, removePhoto); }} className="space-y-6">

            {/* Photo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3">
                <div className="relative">
                    {displayPhoto ? (
                        <img src={displayPhoto} alt="Pet" className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg" />
                    ) : (
                        <div className="w-28 h-28 rounded-2xl bg-orange-50 flex items-center justify-center border-4 border-white shadow-lg">
                            <PawPrint className="w-10 h-10 text-orange-200" />
                        </div>
                    )}
                    <button type="button" onClick={() => document.getElementById('pet-photo')?.click()}
                        className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-colors">
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
                <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 3 MB</p>
                {photoErr && <p className="text-red-500 text-xs">{photoErr}</p>}
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-black text-gray-800 text-sm mb-5 flex items-center gap-2"><PawPrint className="w-4 h-4 text-orange-500" /> Pet Info</h2>
                <div className="space-y-4">

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Buddy"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${f('name')}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Species <span className="text-red-500">*</span></label>
                            <select value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${f('species')}`}>
                                {SPECIES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Sex</label>
                            <select value={form.sex} onChange={e => setForm(p => ({ ...p, sex: e.target.value }))}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${f('sex')}`}>
                                <option value="">Unknown</option>
                                {SEX_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Breed</label>
                            <input type="text" value={form.breed} onChange={e => setForm(p => ({ ...p, breed: e.target.value }))}
                                placeholder="e.g. Golden Retriever"
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${f('breed')}`} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Birthday</label>
                            <input type="date" value={form.birthday} max={new Date().toISOString().split('T')[0]}
                                onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${f('birthday')}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Link href={route('owner.pets.index')}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                </Link>
                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl font-black text-sm transition-colors shadow-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Pet'}
                </button>
            </div>
        </form>
    );
}

export default function PetCreate() {
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (form: any, photo: File | null, _removePhoto: boolean) => {
        setSaving(true);
        const res = await petService.createPet({ ...form, photo: photo ?? undefined });
        setSaving(false);
        if (res.success) {
            await Swal.fire({ title: 'Pet Added!', icon: 'success', timer: 1500, showConfirmButton: false });
            router.visit(route('owner.pets.index'));
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

    return (
        <OwnerLayout>
            <Head title="Add Pet — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.pets.index')} className="inline-flex items-center gap-1.5 text-orange-100 hover:text-white text-sm font-semibold mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Pets
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight">Add New Pet</h1>
                        <p className="text-orange-100 text-sm mt-1">Fill in your pet's details below</p>
                    </div>
                </div>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                    <PetForm onSubmit={handleSubmit} saving={saving} errors={errors} />
                </div>
            </div>
        </OwnerLayout>
    );
}
