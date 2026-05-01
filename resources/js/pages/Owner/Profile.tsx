// resources/js/pages/Owner/Profile.tsx
// API: GET /api/owner/profile
//      POST /api/owner/profile (_method=PUT)

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    User, Mail, Phone, MapPin, Lock, Eye, EyeOff,
    Save, Loader2, Edit2, Camera, X, ChevronLeft, ChevronDown,
} from 'lucide-react';
import Swal from 'sweetalert2';
import OwnerLayout from '@/layouts/owner-layout';
import { petOwnerService } from '@/services/happy-tails';
import type { PetOwner } from '@/services/happy-tails/types';

const SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

function pwStrength(pw: string): { score: number; label: string; color: string } {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'];
    return { score, label: labels[score], color: colors[score] };
}

export default function OwnerProfile() {
    const [profile,  setProfile]  = useState<PetOwner | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [errors,   setErrors]   = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        last_name: '', first_name: '', middle_name: '', suffix: '',
        phone_number: '', address: '',
    });
    const [photoFile, setPhotoFile]   = useState<File | null>(null);
    const [preview,   setPreview]     = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [photoErr,  setPhotoErr]    = useState('');

    // Password section
    const [pwOpen,  setPwOpen]  = useState(false);
    const [pw,      setPw]      = useState({ current: '', password: '', confirm: '' });
    const [pwErrs,  setPwErrs]  = useState<Record<string, string>>({});
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [savingPw,setSavingPw]= useState(false);

    useEffect(() => {
        petOwnerService.getProfile().then(res => {
            if (res.success && res.data) {
                const p = res.data;
                setProfile(p);
                setForm({
                    last_name:    p.last_name    ?? '',
                    first_name:   p.first_name   ?? '',
                    middle_name:  p.middle_name  ?? '',
                    suffix:       p.suffix       ?? '',
                    phone_number: p.phone_number ?? '',
                    address:      (p as any).address ?? '',
                });
            }
            setLoading(false);
        });
    }, []);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setPhotoErr('');
        if (!f) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { setPhotoErr('JPG, PNG, or WEBP only.'); return; }
        if (f.size > 2 * 1024 * 1024) { setPhotoErr('Max 2 MB.'); return; }
        setPhotoFile(f);
        setRemovePhoto(false);
        setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        const errs: Record<string, string> = {};
        if (!form.last_name.trim())  errs.last_name  = 'Last name is required.';
        if (!form.first_name.trim()) errs.first_name = 'First name is required.';
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        const res = await petOwnerService.updateProfile({
            last_name:    form.last_name,
            first_name:   form.first_name,
            middle_name:  form.middle_name  || undefined,
            suffix:       form.suffix       || undefined,
            phone_number: form.phone_number || undefined,
            address:      (form as any).address || undefined,
            profile_photo: photoFile ?? (removePhoto ? null : undefined),
        });
        setSaving(false);

        if (res.success && res.data) {
            setProfile(res.data);
            setEditMode(false);
            setErrors({});
            setPhotoFile(null);
            setPreview(null);
            Swal.fire({ title: 'Profile Updated!', icon: 'success', timer: 2000, showConfirmButton: false });
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

    const cancelEdit = () => {
        setEditMode(false);
        setErrors({});
        setPhotoFile(null);
        setPreview(null);
        setRemovePhoto(false);
        if (profile) {
            setForm({
                last_name: profile.last_name ?? '', first_name: profile.first_name ?? '',
                middle_name: profile.middle_name ?? '', suffix: profile.suffix ?? '',
                phone_number: profile.phone_number ?? '', address: (profile as any).address ?? '',
            });
        }
    };

    const handleSavePw = async () => {
        const errs: Record<string, string> = {};
        if (!pw.current) errs.current = 'Current password required.';
        if (!pw.password || pw.password.length < 8) errs.password = 'Min 8 characters.';
        else if (!/[A-Z]/.test(pw.password)) errs.password = 'Must have an uppercase letter.';
        else if (!/[0-9]/.test(pw.password)) errs.password = 'Must have a number.';
        if (pw.password !== pw.confirm) errs.confirm = 'Passwords do not match.';
        if (Object.keys(errs).length) { setPwErrs(errs); return; }

        setSavingPw(true);
        const res = await petOwnerService.updateProfile({
            password:              pw.password,
            password_confirmation: pw.confirm,
        });
        setSavingPw(false);

        if (res.success) {
            setPw({ current: '', password: '', confirm: '' });
            setPwErrs({});
            setPwOpen(false);
            Swal.fire({ title: 'Password Changed!', icon: 'success', timer: 2000, showConfirmButton: false });
        } else {
            if (res.errors) {
                const m: Record<string, string> = {};
                Object.entries(res.errors).forEach(([k, v]) => { m[k] = Array.isArray(v) ? v[0] : String(v); });
                setPwErrs(m);
            } else {
                Swal.fire({ title: 'Error', text: res.message, icon: 'error' });
            }
        }
    };

    const strength = pwStrength(pw.password);
    const displayPhoto = preview ?? (removePhoto ? null : profile?.profile_photo_url);
    const initials = profile ? (profile.first_name?.[0] ?? '') + (profile.last_name?.[0] ?? '') : '?';
    const fullName  = profile ? `${profile.last_name}, ${profile.first_name}${profile.middle_name ? ' ' + profile.middle_name[0] + '.' : ''}${profile.suffix ? ' ' + profile.suffix : ''}` : '';

    const inputCls = (field: string) =>
        `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${
            errors[field] ? 'border-red-400 bg-red-50' : editMode ? 'border-gray-200 bg-white hover:border-orange-300 focus:ring-orange-400' : 'border-gray-200 bg-gray-50 cursor-default'
        }`;

    if (loading) return (
        <OwnerLayout>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-300" />
            </div>
        </OwnerLayout>
    );

    return (
        <OwnerLayout>
            <Head title="My Profile — Happy Tails" />
            <div className="min-h-screen bg-slate-50">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                        <Link href={route('owner.dashboard')} className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6 text-sm font-medium">
                            <ChevronLeft className="w-4 h-4" /> Dashboard
                        </Link>
                        <div className="flex items-center gap-6">
                            {displayPhoto ? (
                                <img src={displayPhoto} alt="Profile" className="w-20 h-20 rounded-3xl object-cover border-4 border-white/30 shadow-xl" />
                            ) : (
                                <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-3xl font-black border-4 border-white/30">
                                    {initials}
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-black">{fullName || 'Pet Owner'}</h1>
                                <p className="text-orange-100 text-sm mt-1">{profile?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                    {/* Profile card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-500" /> Profile Information
                            </h2>
                            {!editMode && (
                                <button onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-semibold text-sm transition-colors">
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                            )}
                        </div>

                        <div className="p-8">
                            {/* Photo upload (edit mode) */}
                            {editMode && (
                                <div className="flex flex-col items-center gap-3 mb-8">
                                    <div className="relative">
                                        {displayPhoto ? (
                                            <img src={displayPhoto} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl font-black text-orange-400 border-4 border-white shadow-lg">
                                                {initials}
                                            </div>
                                        )}
                                        <button type="button" onClick={() => document.getElementById('owner-photo')?.click()}
                                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-colors">
                                            <Camera className="w-3.5 h-3.5" />
                                        </button>
                                        {displayPhoto && (
                                            <button type="button" onClick={() => { setPhotoFile(null); setPreview(null); setRemovePhoto(true); }}
                                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <input id="owner-photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
                                    <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 2 MB</p>
                                    {photoErr && <p className="text-red-500 text-xs">{photoErr}</p>}
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Read-only fields */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="email" value={profile?.email ?? ''} readOnly className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 cursor-default" />
                                        </div>
                                    </div>
                                </div>

                                {/* Editable name fields */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Last Name *</label>
                                        <input type="text" value={editMode ? form.last_name : (profile?.last_name ?? '')}
                                            onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                                            readOnly={!editMode} className={inputCls('last_name')} />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                    <div className="w-28">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Suffix</label>
                                        {editMode ? (
                                            <div className="relative">
                                                <select value={form.suffix} onChange={e => setForm(p => ({ ...p, suffix: e.target.value }))}
                                                    className="w-full appearance-none px-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400">
                                                    <option value="">None</option>
                                                    {SUFFIXES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        ) : (
                                            <div className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600">{profile?.suffix || '—'}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">First Name *</label>
                                        <input type="text" value={editMode ? form.first_name : (profile?.first_name ?? '')}
                                            onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                                            readOnly={!editMode} className={inputCls('first_name')} />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Middle Name</label>
                                        <input type="text" value={editMode ? form.middle_name : (profile?.middle_name ?? '')}
                                            onChange={e => setForm(p => ({ ...p, middle_name: e.target.value }))}
                                            readOnly={!editMode} className={inputCls('middle_name')} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="tel" value={editMode ? form.phone_number : (profile?.phone_number ?? '')}
                                            onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                                            readOnly={!editMode} placeholder="+63 912 345 6789"
                                            className={`${inputCls('phone_number')} pl-10`} />
                                    </div>
                                    {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                        <textarea rows={2} value={editMode ? (form as any).address : ((profile as any)?.address ?? '')}
                                            onChange={e => setForm(p => ({ ...p, address: e.target.value } as any))}
                                            readOnly={!editMode}
                                            className={`${inputCls('address')} pl-10 resize-none`} />
                                    </div>
                                </div>

                                {editMode && (
                                    <div className="flex gap-4 pt-2">
                                        <button onClick={cancelEdit}
                                            className="flex-1 py-3 rounded-2xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 text-sm transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleSave} disabled={saving}
                                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Change Password card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <button onClick={() => { setPwOpen(v => !v); if (pwOpen) { setPw({ current: '', password: '', confirm: '' }); setPwErrs({}); } }}
                            className="w-full px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Change Password</p>
                                    <p className="text-sm text-gray-500">Update your account password</p>
                                </div>
                            </div>
                            <span className="text-orange-500 font-medium text-sm">{pwOpen ? 'Cancel' : 'Update'}</span>
                        </button>

                        {pwOpen && (
                            <div className="p-8 space-y-5 border-t">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">Current Password</label>
                                    <div className="relative">
                                        <input type={showCur ? 'text' : 'password'} value={pw.current}
                                            onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none text-sm" />
                                        <button type="button" onClick={() => setShowCur(v => !v)} className="absolute right-3.5 top-3.5 text-gray-400">
                                            {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {pwErrs.current && <p className="text-red-500 text-xs mt-1">{pwErrs.current}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">New Password</label>
                                        <div className="relative">
                                            <input type={showNew ? 'text' : 'password'} value={pw.password}
                                                onChange={e => setPw(p => ({ ...p, password: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none text-sm pr-10" />
                                            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3.5 top-3.5 text-gray-400">
                                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {pw.password && <p className={`text-xs mt-1 font-medium ${strength.color}`}>{strength.label}</p>}
                                        {pwErrs.password && <p className="text-red-500 text-xs mt-1">{pwErrs.password}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-2 block">Confirm Password</label>
                                        <input type={showNew ? 'text' : 'password'} value={pw.confirm}
                                            onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none text-sm" />
                                        {pwErrs.confirm && <p className="text-red-500 text-xs mt-1">{pwErrs.confirm}</p>}
                                    </div>
                                </div>

                                <button onClick={handleSavePw} disabled={savingPw}
                                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl disabled:opacity-70 flex items-center justify-center gap-2 text-sm transition-colors">
                                    {savingPw ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
