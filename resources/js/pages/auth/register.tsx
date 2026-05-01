import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {
    PawPrint, Stethoscope, Mail, Lock, Eye, EyeOff,
    ArrowLeft, User, Phone, MapPin, ChevronDown,
    Building2, ChevronRight,
} from 'lucide-react';

// ─── Props from controllers ────────────────────────────────────────────────────
interface Props {
    // Passed by RegisteredPetOwnerController::create()
    suffixes?: string[]; // ['Jr.', 'Sr.', 'II', 'III', 'IV']
}

// ─── Step type ─────────────────────────────────────────────────────────────────
type UserType = 'owner' | 'clinic' | null;

// ─── Shared style helpers ──────────────────────────────────────────────────────
const inputBase = 'w-full py-3 rounded-xl border text-sm bg-white transition-all outline-none';
const inputOk   = (ring: string) => `border-gray-200 focus:ring-2 ${ring}`;
const inputErr  = 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="mt-1.5 text-xs text-red-600 font-medium">{msg}</p>;
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — User type picker
// ══════════════════════════════════════════════════════════════════════════════
function TypePicker({ onSelect }: { onSelect: (t: UserType) => void }) {
    const cards = [
        {
            type:        'owner' as UserType,
            icon:        PawPrint,
            label:       'Pet Owner',
            description: 'Register to track your pets\' health, vaccinations, grooming & reminders.',
            gradient:    'from-orange-500 to-amber-500',
            border:      'border-orange-200 hover:border-orange-400',
            bg:          'hover:bg-orange-50/60',
            chevron:     'text-orange-400',
            badge:       'bg-orange-100 text-orange-600',
        },
        {
            type:        'clinic' as UserType,
            icon:        Stethoscope,
            label:       'Vet Clinic',
            description: 'Register your clinic to monitor pets, manage records & coordinate care.',
            gradient:    'from-teal-500 to-cyan-500',
            border:      'border-teal-200 hover:border-teal-400',
            bg:          'hover:bg-teal-50/60',
            chevron:     'text-teal-400',
            badge:       'bg-teal-100 text-teal-600',
        },
    ] as const;

    return (
        <div className="px-8 py-7">
            <div className="mb-7 text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Get Started</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Create an Account</h2>
                <p className="text-sm text-gray-500 mt-1">Who are you registering as?</p>
            </div>

            <div className="space-y-3">
                {cards.map(({ type, icon: Icon, label, description, gradient, border, bg, chevron, badge }) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onSelect(type)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group ${border} ${bg}`}
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-gray-900 text-sm">{label}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                                    Happy Tails
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className={`w-5 h-5 shrink-0 ${chevron} group-hover:translate-x-0.5 transition-transform`} />
                    </button>
                ))}
            </div>

            {/* Already have account */}
            <p className="text-center text-sm text-gray-500 mt-7">
                Already have an account?{' '}
                <Link href={route('owner.login')} className="font-bold text-orange-500 hover:text-orange-700 underline underline-offset-2">
                    Sign in
                </Link>
            </p>

            {/* TSF crosslink */}
            <p className="text-center text-xs text-gray-400 mt-3">
                TSF Student?{' '}
                <a href={route('register')} className="font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    Go to Student Portal
                </a>
            </p>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2A — Pet Owner registration form
// ══════════════════════════════════════════════════════════════════════════════
interface OwnerFormData {
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

function OwnerForm({ suffixes, onBack }: { suffixes: string[]; onBack: () => void }) {
    const [showPw,  setShowPw]  = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const ring = 'focus:ring-orange-100 focus:border-orange-400';

    const { data, setData, post, processing, errors, reset } = useForm<OwnerFormData>({
        last_name:             '',
        first_name:            '',
        middle_name:           '',
        suffix:                '',
        email:                 '',
        phone_number:          '',
        address:               '',
        password:              '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('owner.register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const ic = (hasErr: boolean) => `${inputBase} pl-10 pr-4 ${hasErr ? inputErr : inputOk(ring)}`;

    return (
        <div className="px-8 py-7">
            {/* Back */}
            <button type="button" onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-6">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <PawPrint className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Pet Owner Registration</h2>
                <p className="text-xs text-gray-400 mt-1">All fields marked <span className="text-red-400">*</span> are required</p>
            </div>

            <form onSubmit={submit} className="space-y-5">

                {/* ── Name ──────────────────────────────────────────────── */}
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Name</p>

                    {/* Last name + Suffix */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Last Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" required autoFocus
                                    value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                                    placeholder="Dela Cruz" autoComplete="family-name"
                                    className={ic(!!errors.last_name)} />
                            </div>
                            <FieldError msg={errors.last_name} />
                        </div>

                        {/* Suffix */}
                        <div className="w-28">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Suffix</label>
                            <div className="relative">
                                <select value={data.suffix} onChange={e => setData('suffix', e.target.value)}
                                    className={`${inputBase} px-3 pr-8 appearance-none ${inputOk(ring)}`}>
                                    <option value="">None</option>
                                    {suffixes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* First + Middle */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                First Name <span className="text-red-400">*</span>
                            </label>
                            <input type="text" required
                                value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                                placeholder="Juan" autoComplete="given-name"
                                className={`${inputBase} px-4 ${errors.first_name ? inputErr : inputOk(ring)}`} />
                            <FieldError msg={errors.first_name} />
                        </div>
                        <div className="w-36">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Middle Name</label>
                            <input type="text"
                                value={data.middle_name} onChange={e => setData('middle_name', e.target.value)}
                                placeholder="Santos" autoComplete="additional-name"
                                className={`${inputBase} px-4 ${inputOk(ring)}`} />
                        </div>
                    </div>
                </div>

                {/* ── Contact ───────────────────────────────────────────── */}
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contact</p>
                    <div className="space-y-3">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="email" required autoComplete="email"
                                    value={data.email} onChange={e => setData('email', e.target.value)}
                                    placeholder="juan@example.com"
                                    className={ic(!!errors.email)} />
                            </div>
                            <FieldError msg={errors.email} />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="tel" autoComplete="tel"
                                    value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                                    placeholder="+63 912 345 6789"
                                    className={ic(!!errors.phone_number)} />
                            </div>
                            <FieldError msg={errors.phone_number} />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                <textarea rows={2}
                                    value={data.address} onChange={e => setData('address', e.target.value)}
                                    placeholder="123 Main St, Quezon City"
                                    className={`${inputBase} pl-10 pr-4 resize-none ${inputOk(ring)}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Password ──────────────────────────────────────────── */}
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
                                    placeholder="Min 8 chars"
                                    className={`${inputBase} pl-10 pr-10 ${errors.password ? inputErr : inputOk(ring)}`} />
                                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <FieldError msg={errors.password} />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Confirm <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type={showCpw ? 'text' : 'password'} required autoComplete="new-password"
                                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="Repeat"
                                    className={`${inputBase} pl-10 pr-10 ${errors.password_confirmation ? inputErr : inputOk(ring)}`} />
                                <button type="button" tabIndex={-1} onClick={() => setShowCpw(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <FieldError msg={errors.password_confirmation} />
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">Min 8 characters, one uppercase letter and one number.</p>
                </div>

                {/* Submit */}
                <button type="submit" disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-200 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                    {processing
                        ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Creating account…</>
                        : <><PawPrint className="w-4 h-4" />Create Owner Account</>
                    }
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href={route('owner.login')} className="font-bold text-orange-500 hover:text-orange-700 underline underline-offset-2">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2B — Vet Clinic registration form
// ══════════════════════════════════════════════════════════════════════════════
interface ClinicFormData {
    clinic_name:           string;
    email:                 string;
    phone_number:          string;
    address:               string;
    password:              string;
    password_confirmation: string;
}

function ClinicForm({ onBack }: { onBack: () => void }) {
    const [showPw,  setShowPw]  = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const ring = 'focus:ring-teal-100 focus:border-teal-400';

    const { data, setData, post, processing, errors, reset } = useForm<ClinicFormData>({
        clinic_name:           '',
        email:                 '',
        phone_number:          '',
        address:               '',
        password:              '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clinic.register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const ic = (hasErr: boolean) => `${inputBase} pl-10 pr-4 ${hasErr ? inputErr : inputOk(ring)}`;

    return (
        <div className="px-8 py-7">
            {/* Back */}
            <button type="button" onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-6">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Clinic Registration</h2>
                <p className="text-xs text-gray-400 mt-1">All fields marked <span className="text-red-400">*</span> are required</p>
            </div>

            <form onSubmit={submit} className="space-y-5">

                {/* ── Clinic Info ───────────────────────────────────────── */}
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Clinic Info</p>
                    <div className="space-y-3">

                        {/* Clinic Name */}
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
                            <FieldError msg={errors.clinic_name} />
                        </div>

                        {/* Email */}
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
                            <FieldError msg={errors.email} />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="tel" autoComplete="tel"
                                    value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                                    placeholder="+63 912 345 6789"
                                    className={ic(!!errors.phone_number)} />
                            </div>
                            <FieldError msg={errors.phone_number} />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Clinic Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                <textarea rows={2}
                                    value={data.address} onChange={e => setData('address', e.target.value)}
                                    placeholder="123 Vet St, Tanauan City"
                                    className={`${inputBase} pl-10 pr-4 resize-none ${inputOk(ring)}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Password ──────────────────────────────────────────── */}
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
                                    placeholder="Min 8 chars"
                                    className={`${inputBase} pl-10 pr-10 ${errors.password ? inputErr : inputOk(ring)}`} />
                                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <FieldError msg={errors.password} />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Confirm <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type={showCpw ? 'text' : 'password'} required autoComplete="new-password"
                                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="Repeat"
                                    className={`${inputBase} pl-10 pr-10 ${errors.password_confirmation ? inputErr : inputOk(ring)}`} />
                                <button type="button" tabIndex={-1} onClick={() => setShowCpw(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <FieldError msg={errors.password_confirmation} />
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">Min 8 characters, one uppercase letter and one number.</p>
                </div>

                {/* Submit */}
                <button type="submit" disabled={processing}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-sm shadow-md shadow-teal-200 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                    {processing
                        ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Creating account…</>
                        : <><Stethoscope className="w-4 h-4" />Create Clinic Account</>
                    }
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href={route('owner.login')}
                    className="font-bold text-teal-600 hover:text-teal-800 underline underline-offset-2">
                    Sign in
                </Link>
            </p>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Root — orchestrates the two steps
// ══════════════════════════════════════════════════════════════════════════════
export default function HappyTailsRegister({ suffixes = [] }: Props) {
    const [userType, setUserType] = useState<UserType>(null);

    // Header gradient changes based on selection
    const headerGradient = userType === 'clinic'
        ? 'from-teal-500 to-cyan-500'
        : 'from-orange-500 to-amber-500';

    const HeaderIcon = userType === 'clinic' ? Stethoscope : PawPrint;

    return (
        <>
            <Head title="Register — Happy Tails" />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 flex items-center justify-center p-4 py-10">

                {/* Blobs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

                        {/* Gradient header */}
                        <div className={`px-8 pt-8 pb-6 flex flex-col items-center bg-gradient-to-br ${headerGradient} transition-all duration-500`}>
                            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 shadow-lg">
                                <HeaderIcon className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight">Happy Tails</h1>
                            <p className="text-white/70 text-xs mt-0.5">
                                {userType === 'clinic' ? 'Clinic Registration' : userType === 'owner' ? 'Pet Owner Registration' : 'Create an Account'}
                            </p>
                        </div>

                        {/* Step content */}
                        {userType === null  && <TypePicker onSelect={setUserType} />}
                        {userType === 'owner'  && <OwnerForm  suffixes={suffixes} onBack={() => setUserType(null)} />}
                        {userType === 'clinic' && <ClinicForm onBack={() => setUserType(null)} />}
                    </div>
                </div>
            </div>
        </>
    );
}