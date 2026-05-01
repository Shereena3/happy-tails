// resources/js/pages/auth/owner-register.tsx
// Rendered by: RegisteredPetOwnerController::create()
// POST to:     route('owner.register')

import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {
    PawPrint, Mail, Lock, Eye, EyeOff,
    ArrowLeft, User, Phone, MapPin, ChevronDown,
} from 'lucide-react';

interface Props {
    suffixes: string[]; // PetOwner::SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV']
}

interface OwnerForm {
    last_name:             string;
    first_name:            string;
    middle_name:           string;
    suffix:                string;
    email:                 string;
    phone_number:          string;
    address:               string;
    password:              string;
    password_confirmation: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const base = 'w-full py-3 rounded-xl border text-sm bg-white transition-all outline-none';
const ring = 'focus:ring-[#F8C8DC] focus:border-[#D18BB0]';
const ok   = `border-gray-200 focus:ring-2 ${ring}`;
const err  = 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';

function Err({ msg }: { msg?: string }) {
    return msg ? <p className="mt-1.5 text-xs text-red-600 font-medium">{msg}</p> : null;
}

export default function OwnerRegister({ suffixes }: Props) {
    const [showPw,  setShowPw]  = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<OwnerForm>({
        last_name: '', first_name: '', middle_name: '', suffix: '',
        email: '', phone_number: '', address: '',
        password: '', password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('owner.register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const ic  = (hasErr: boolean) => `${base} pl-10 pr-4 ${hasErr ? err : ok}`;
    const icp = (hasErr: boolean) => `${base} pl-10 pr-10 ${hasErr ? err : ok}`;

    return (
        <>
            <Head title="Pet Owner Registration — Happy Tails" />

            <div className="min-h-screen bg-[#F8C8DC]/20 flex items-center justify-center p-4 py-10">
                {/* Blobs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F8C8DC]/40 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#D18BB0]/30 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

                        {/* Header */}
                       <div className="px-8 pt-8 pb-6 flex flex-col items-center bg-[#F8C8DC]">
                            <div className="mb-3 flex justify-center">
                              <img
                                src="/images/logo.png"
                                alt="Happy Tails Logo"
                                className="w-16 h-16 object-contain drop-shadow-xl"
                            />
                        </div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight">Happy Tails</h1>
                            <p className="text-white/70 text-xs mt-0.5">Pet Owner Registration</p>
                        </div>

                        <div className="px-8 py-7">
                            {/* Back */}
                            <Link href={route('owner.login')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-6">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                            </Link>

                            <form onSubmit={submit} className="space-y-5">

                                {/* ── Name ──────────────────────────────── */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Name</p>

                                    {/* Last name + suffix */}
                                    <div className="flex gap-3 mb-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Last Name <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="text" required autoFocus autoComplete="family-name"
                                                    value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                                                    placeholder="Dela Cruz" className={ic(!!errors.last_name)} />
                                            </div>
                                            <Err msg={errors.last_name} />
                                        </div>
                                        <div className="w-28">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Suffix</label>
                                            <div className="relative">
                                                <select value={data.suffix} onChange={e => setData('suffix', e.target.value)}
                                                    className={`${base} px-3 pr-8 appearance-none ${ok}`}>
                                                    <option value="">None</option>
                                                    {suffixes.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* First + middle */}
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                First Name <span className="text-red-400">*</span>
                                            </label>
                                            <input type="text" required autoComplete="given-name"
                                                value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                                                placeholder="Juan" className={`${base} px-4 ${errors.first_name ? err : ok}`} />
                                            <Err msg={errors.first_name} />
                                        </div>
                                        <div className="w-36">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Middle Name</label>
                                            <input type="text" autoComplete="additional-name"
                                                value={data.middle_name} onChange={e => setData('middle_name', e.target.value)}
                                                placeholder="Santos" className={`${base} px-4 ${ok}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Contact ───────────────────────────── */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contact</p>
                                    <div className="space-y-3">

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Email Address <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="email" required autoComplete="email"
                                                    value={data.email} onChange={e => setData('email', e.target.value)}
                                                    placeholder="juan@example.com" className={ic(!!errors.email)} />
                                            </div>
                                            <Err msg={errors.email} />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="tel" autoComplete="tel"
                                                    value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                                                    placeholder="+63 912 345 6789" className={ic(!!errors.phone_number)} />
                                            </div>
                                            <Err msg={errors.phone_number} />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                                <textarea rows={2}
                                                    value={data.address} onChange={e => setData('address', e.target.value)}
                                                    placeholder="123 Main St, Quezon City"
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
    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D18BB0] hover:bg-[#c2799b] text-white font-bold text-sm shadow-md shadow-[#F8C8DC] transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                                    {processing
                                        ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Creating account…</>
                                        : <><PawPrint className="w-4 h-4" />Create Owner Account</>}
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Already have an account?{' '}
                               <Link href={route('owner.login')} className="font-bold text-[#D18BB0] hover:text-[#a96588] underline underline-offset-2">
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
