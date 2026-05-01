// resources/js/pages/auth/clinic-register.tsx
// Rendered by: RegisteredPetClinicController::create()
// POST to:     route('clinic.register')

import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {
    Stethoscope, Mail, Lock, Eye, EyeOff,
    ArrowLeft, Building2, Phone, MapPin,
} from 'lucide-react';

interface ClinicForm {
    clinic_name:           string;
    email:                 string;
    phone_number:          string;
    address:               string;
    password:              string;
    password_confirmation: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const base = 'w-full py-3 rounded-xl border text-sm bg-white transition-all outline-none';
const ring = 'focus:ring-teal-100 focus:border-teal-400';
const ok   = `border-gray-200 focus:ring-2 ${ring}`;
const err  = 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';

function Err({ msg }: { msg?: string }) {
    return msg ? <p className="mt-1.5 text-xs text-red-600 font-medium">{msg}</p> : null;
}

export default function ClinicRegister() {
    const [showPw,  setShowPw]  = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<ClinicForm>({
        clinic_name: '', email: '', phone_number: '', address: '',
        password: '', password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clinic.register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const ic  = (hasErr: boolean) => `${base} pl-10 pr-4 ${hasErr ? err : ok}`;
    const icp = (hasErr: boolean) => `${base} pl-10 pr-10 ${hasErr ? err : ok}`;

    return (
        <>
            <Head title="Clinic Registration — Happy Tails" />

            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 flex items-center justify-center p-4 py-10">
                {/* Blobs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-200/30 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

                        {/* Header */}
                        <div className="px-8 pt-8 pb-6 flex flex-col items-center bg-gradient-to-br from-teal-500 to-cyan-500">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 shadow-lg">
                                <Stethoscope className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight">Happy Tails</h1>
                            <p className="text-white/70 text-xs mt-0.5">Clinic Registration</p>
                        </div>

                        <div className="px-8 py-7">
                            {/* Back */}
                            <Link href={route('owner.login')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-6">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                            </Link>

                            <form onSubmit={submit} className="space-y-5">

                                {/* ── Clinic Info ───────────────────────── */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Clinic Info</p>
                                    <div className="space-y-3">

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Clinic Name <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="text" required autoFocus
                                                    value={data.clinic_name} onChange={e => setData('clinic_name', e.target.value)}
                                                    placeholder="Happy Paws Veterinary Clinic"
                                                    className={ic(!!errors.clinic_name)} />
                                            </div>
                                            <Err msg={errors.clinic_name} />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Email Address <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="email" required autoComplete="email"
                                                    value={data.email} onChange={e => setData('email', e.target.value)}
                                                    placeholder="clinic@example.com"
                                                    className={ic(!!errors.email)} />
                                            </div>
                                            <Err msg={errors.email} />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="tel" autoComplete="tel"
                                                    value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                                                    placeholder="+63 912 345 6789"
                                                    className={ic(!!errors.phone_number)} />
                                            </div>
                                            <Err msg={errors.phone_number} />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Clinic Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                                <textarea rows={2}
                                                    value={data.address} onChange={e => setData('address', e.target.value)}
                                                    placeholder="123 Vet St, Tanauan City"
                                                    className={`${base} pl-10 pr-4 resize-none ${ok}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Password ──────────────────────────── */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Password</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Password <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                                                    value={data.password} onChange={e => setData('password', e.target.value)}
                                                    placeholder="Min 8 chars" className={icp(!!errors.password)} />
                                                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <Err msg={errors.password} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Confirm <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type={showCpw ? 'text' : 'password'} required autoComplete="new-password"
                                                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                                    placeholder="Repeat" className={icp(!!errors.password_confirmation)} />
                                                <button type="button" tabIndex={-1} onClick={() => setShowCpw(v => !v)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <Err msg={errors.password_confirmation} />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1.5">Min 8 chars, one uppercase letter and one number.</p>
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={processing}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-sm shadow-md shadow-teal-200 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                                    {processing
                                        ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Creating account…</>
                                        : <><Stethoscope className="w-4 h-4" />Register Clinic</>}
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Already have an account?{' '}
                                <Link href={route('owner.login')} className="font-bold text-teal-600 hover:text-teal-800 underline underline-offset-2">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
