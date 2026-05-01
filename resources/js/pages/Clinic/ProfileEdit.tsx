// resources/js/pages/Clinic/ProfileEdit.tsx
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Stethoscope, Mail, Phone, MapPin, Save, Loader2,
    ChevronLeft, Camera, X, Lock, Eye, EyeOff, ChevronDown,
    AlertCircle, CheckCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import ClinicLayout from '@/layouts/clinic-layout';

interface Clinic {
    id: number;
    clinic_name: string;
    email: string;
    phone_number?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    profile_photo_url?: string;
    is_active: boolean;
    created_at: string;
}

const getCsrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

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

export default function ClinicProfileEdit() {
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form state
    const [form, setForm] = useState({
        clinic_name: '',
        email: '',
        phone_number: '',
        address: '',
        latitude: '',
        longitude: '',
    });

    // Photo state
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [photoErr, setPhotoErr] = useState('');

    // Password section
    const [pwOpen, setPwOpen] = useState(false);
    const [pw, setPw] = useState({ password: '', confirm: '' });
    const [pwErrs, setPwErrs] = useState<Record<string, string>>({});
    const [showPw, setShowPw] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    useEffect(() => {
        fetch('/api/clinic/profile', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then(r => r.json())
            .then(j => {
                if (j.success && j.data) {
                    const c = j.data;
                    setClinic(c);
                    setForm({
                        clinic_name: c.clinic_name ?? '',
                        email: c.email ?? '',
                        phone_number: c.phone_number ?? '',
                        address: c.address ?? '',
                        latitude: c.latitude?.toString() ?? '',
                        longitude: c.longitude?.toString() ?? '',
                    });
                }
                setLoading(false);
            });
    }, []);

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setPhotoErr('');
        if (!f) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
            setPhotoErr('JPG, PNG, or WEBP only.');
            return;
        }
        if (f.size > 2 * 1024 * 1024) {
            setPhotoErr('Max 2 MB.');
            return;
        }
        setPhotoFile(f);
        setRemovePhoto(false);
        setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        const errs: Record<string, string> = {};
        if (!form.clinic_name.trim()) errs.clinic_name = 'Clinic name is required.';
        if (!form.email.trim()) errs.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required.';
        if (form.latitude && (isNaN(Number(form.latitude)) || Number(form.latitude) < -90 || Number(form.latitude) > 90)) {
            errs.latitude = 'Latitude must be between -90 and 90.';
        }
        if (form.longitude && (isNaN(Number(form.longitude)) || Number(form.longitude) < -180 || Number(form.longitude) > 180)) {
            errs.longitude = 'Longitude must be between -180 and 180.';
        }

        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSaving(true);
        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('clinic_name', form.clinic_name);
        fd.append('email', form.email);
        if (form.phone_number) fd.append('phone_number', form.phone_number);
        if (form.address) fd.append('address', form.address);
        if (form.latitude) fd.append('latitude', form.latitude);
        if (form.longitude) fd.append('longitude', form.longitude);
        if (photoFile) {
            fd.append('profile_photo', photoFile);
        } else if (removePhoto) {
            fd.append('remove_profile_photo', '1');
        }

        try {
            const res = await fetch('/api/clinic/profile', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                body: fd,
            });
            const json = await res.json();
            setSaving(false);

            if (json.success && json.data) {
                Swal.fire({
                    title: 'Profile Updated!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
                window.location.href = route('clinic.profile');
            } else {
                if (json.errors) {
                    const m: Record<string, string> = {};
                    Object.entries(json.errors).forEach(([k, v]) => {
                        m[k] = Array.isArray(v) ? v[0] : String(v);
                    });
                    setErrors(m);
                } else {
                    Swal.fire({ title: 'Error', text: json.message, icon: 'error' });
                }
            }
        } catch (error) {
            setSaving(false);
            Swal.fire({ title: 'Error', text: 'Something went wrong.', icon: 'error' });
        }
    };

    const handleSavePassword = async () => {
        const errs: Record<string, string> = {};
        if (!pw.password || pw.password.length < 8) {
            errs.password = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(pw.password)) {
            errs.password = 'Must contain at least one uppercase letter.';
        } else if (!/[0-9]/.test(pw.password)) {
            errs.password = 'Must contain at least one number.';
        }
        if (pw.password !== pw.confirm) {
            errs.confirm = 'Passwords do not match.';
        }
        if (Object.keys(errs).length) {
            setPwErrs(errs);
            return;
        }

        setSavingPw(true);
        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('password', pw.password);
        fd.append('password_confirmation', pw.confirm);

        try {
            const res = await fetch('/api/clinic/profile', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': getCsrf(), 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
                body: fd,
            });
            const json = await res.json();
            setSavingPw(false);

            if (json.success) {
                setPw({ password: '', confirm: '' });
                setPwErrs({});
                setPwOpen(false);
                Swal.fire({
                    title: 'Password Changed!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                if (json.errors) {
                    const m: Record<string, string> = {};
                    Object.entries(json.errors).forEach(([k, v]) => {
                        m[k] = Array.isArray(v) ? v[0] : String(v);
                    });
                    setPwErrs(m);
                } else {
                    Swal.fire({ title: 'Error', text: json.message, icon: 'error' });
                }
            }
        } catch (error) {
            setSavingPw(false);
            Swal.fire({ title: 'Error', text: 'Something went wrong.', icon: 'error' });
        }
    };

    const strength = pwStrength(pw.password);
    const displayPhoto = preview ?? (removePhoto ? null : clinic?.profile_photo_url);
    const initials = clinic?.clinic_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    const inputClass = (field: string) =>
        `w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${
            errors[field]
                ? 'border-red-400 bg-red-50 focus:ring-red-400'
                : 'border-gray-200 bg-white hover:border-teal-300 focus:ring-teal-400'
        }`;

    if (loading) {
        return (
            <ClinicLayout>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-300" />
                </div>
            </ClinicLayout>
        );
    }

    return (
        <ClinicLayout>
            <Head title="Edit Clinic Profile — Happy Tails" />
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                        <Link
                            href={route('clinic.profile')}
                            className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white text-sm font-semibold mb-4"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Profile
                        </Link>
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <Stethoscope className="w-6 h-6" /> Edit Clinic Profile
                        </h1>
                        <p className="text-teal-100 text-sm mt-1">
                            Update your clinic information and settings
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    {/* Profile Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <Stethoscope className="w-4 h-4 text-teal-500" /> Clinic Information
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
                                <div className="relative">
                                    {displayPhoto ? (
                                        <img
                                            src={displayPhoto}
                                            alt="Clinic"
                                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl bg-teal-100 flex items-center justify-center text-3xl font-black text-teal-400 border-4 border-white shadow-lg">
                                            {initials}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('clinic-photo')?.click()}
                                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-md transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                    {displayPhoto && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhotoFile(null);
                                                setPreview(null);
                                                setRemovePhoto(true);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="clinic-photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhoto}
                                />
                                <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 2 MB</p>
                                {photoErr && <p className="text-red-500 text-xs">{photoErr}</p>}
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        Clinic Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.clinic_name}
                                        onChange={e => setForm(p => ({ ...p, clinic_name: e.target.value }))}
                                        placeholder="e.g. Happy Paws Veterinary Clinic"
                                        className={inputClass('clinic_name')}
                                    />
                                    {errors.clinic_name && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.clinic_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                            className={`${inputClass('email')} pl-10`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={form.phone_number}
                                            onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                                            placeholder="+63 2 1234 5678"
                                            className={`${inputClass('phone_number')} pl-10`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                        <textarea
                                            rows={2}
                                            value={form.address}
                                            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                            placeholder="Full clinic address"
                                            className={`${inputClass('address')} pl-10 resize-none`}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={form.latitude}
                                            onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                                            placeholder="14.5995"
                                            className={inputClass('latitude')}
                                        />
                                        {errors.latitude && (
                                            <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={form.longitude}
                                            onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                                            placeholder="120.9842"
                                            className={inputClass('longitude')}
                                        />
                                        {errors.longitude && (
                                            <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 -mt-2">
                                    Coordinates help pet owners find your clinic on the map
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <Link
                                    href={route('clinic.profile')}
                                    className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 text-sm transition-colors text-center"
                                >
                                    Cancel
                                </Link>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <button
                            onClick={() => {
                                setPwOpen(!pwOpen);
                                if (pwOpen) {
                                    setPw({ password: '', confirm: '' });
                                    setPwErrs({});
                                }
                            }}
                            className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-teal-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Change Password</p>
                                    <p className="text-sm text-gray-500">Update your account password</p>
                                </div>
                            </div>
                            <span className="text-teal-500 font-medium text-sm">
                                {pwOpen ? 'Cancel' : 'Update'}
                            </span>
                        </button>

                        {pwOpen && (
                            <div className="px-6 pb-6 space-y-5 border-t pt-5">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={pw.password}
                                            onChange={e => setPw(p => ({ ...p, password: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {pw.password && (
                                        <p className={`text-xs mt-1 font-medium ${strength.color}`}>
                                            {strength.label}
                                        </p>
                                    )}
                                    {pwErrs.password && (
                                        <p className="text-red-500 text-xs mt-1">{pwErrs.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">Confirm Password</label>
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={pw.confirm}
                                        onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none text-sm"
                                    />
                                    {pwErrs.confirm && (
                                        <p className="text-red-500 text-xs mt-1">{pwErrs.confirm}</p>
                                    )}
                                </div>

                                <button
                                    onClick={handleSavePassword}
                                    disabled={savingPw}
                                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl disabled:opacity-70 flex items-center justify-center gap-2 text-sm transition-colors"
                                >
                                    {savingPw ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ClinicLayout>
    );
}