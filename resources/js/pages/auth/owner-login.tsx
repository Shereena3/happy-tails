// resources/js/pages/auth/owner-login.tsx
// Rendered by: PetOwnerSessionController::create()  (activeTab='owner')
//              PetClinicSessionController::create()  (activeTab='clinic')

import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { PawPrint, Stethoscope, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface Props {
    status?:    string;
    activeTab?: 'owner' | 'clinic';
}

type Tab = 'owner' | 'clinic';

const CFG = {
    owner: {
        label:     'Pet Owner',
        icon:      PawPrint,
        route:     'owner.login',
        grad:      'bg-[#F8C8DC]',
        gradHov:   'hover:bg-[#D18BB0]',
        shadow:    'shadow-[#F8C8DC]',
        ring:      'focus:ring-[#F8C8DC] focus:border-[#D18BB0]',
        check:     'text-[#D18BB0] focus:ring-[#D18BB0]',
        tabOn:     'border-[#D18BB0] text-[#D18BB0] bg-[#F8C8DC]/20',
        tabOff:    'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
    },
    clinic: {
        label:     'Vet Clinic',
        icon:      Stethoscope,
        route:     'clinic.login',
        grad:      'bg-[#D18BB0]',
        gradHov:   'hover:bg-[#c2799b]',
        shadow:    'shadow-[#F8C8DC]',
        ring:      'focus:ring-[#F8C8DC] focus:border-[#D18BB0]',
        check:     'text-[#D18BB0] focus:ring-[#D18BB0]',
        tabOn:     'border-[#D18BB0] text-[#D18BB0] bg-[#F8C8DC]/20',
        tabOff:    'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
    },
} as const;

// Inner form re-mounts on tab change → fields + errors always reset cleanly
function LoginForm({ tab }: { tab: Tab }) {
    const c = CFG[tab];
    const [showPw, setShowPw] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route(c.route), { onFinish: () => reset('password') });
    };

    const base = 'w-full py-3 rounded-xl border text-sm bg-white transition-all outline-none';
    const ok   = `border-gray-200 focus:ring-2 ${c.ring}`;
    const err  = 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';

    return (
        <form onSubmit={submit} className="space-y-5">

            {/* Email */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" autoFocus autoComplete="email"
                        value={data.email} onChange={e => setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className={`${base} pl-10 pr-4 ${errors.email ? err : ok}`} />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPw ? 'text' : 'password'} autoComplete="current-password"
                        value={data.password} onChange={e => setData('password', e.target.value)}
                        placeholder="••••••••"
                        className={`${base} pl-10 pr-10 ${errors.password ? err : ok}`} />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>}
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={data.remember}
                    onChange={e => setData('remember', e.target.checked)}
                    className={`w-4 h-4 rounded border-gray-300 ${c.check}`} />
                <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={processing}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${c.grad} ${c.gradHov} text-white font-bold text-sm shadow-md ${c.shadow} transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0`}>
                {processing
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Signing in…</>
                    : <><LogIn className="w-4 h-4" />Sign In</>}
            </button>
        </form>
    );
}

export default function OwnerLogin({ status, activeTab = 'owner' }: Props) {
    const [tab, setTab] = useState<Tab>(activeTab);
    const c    = CFG[tab];
    const Icon = c.icon;

    return (
        <>
            <Head title={`${c.label} Login — Happy Tails`} />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 flex items-center justify-center p-4">
                {/* Blobs */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

                        {/* Gradient header */}
                        <div className={`px-8 pt-8 pb-6 flex flex-col items-center ${c.grad} transition-all duration-300`}>
                            <div className="mb-3 flex justify-center">
                        <img
                            src="/images/logo.png"
                            alt="Happy Tails Logo"
                            className="w-16 h-16 object-contain drop-shadow-xl"
                        />
                    </div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight">Happy Tails</h1>
                            <p className="text-white/70 text-xs mt-0.5">{c.label} Portal</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-white">
                            {(['owner', 'clinic'] as Tab[]).map(t => {
                                const tc = CFG[t];
                                return (
                                    <button key={t} type="button" onClick={() => setTab(t)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 transition-all ${tab === t ? tc.tabOn : tc.tabOff}`}>
                                        <tc.icon className="w-4 h-4" />{tc.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="px-8 py-7">
                            {status && (
                                <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                                    {status}
                                </div>
                            )}

                            {/* key forces re-mount on tab switch → clears fields + errors */}
                            <LoginForm key={tab} tab={tab} />

                            {/* Register link — owners only */}
                            {tab === 'owner' && (
                                <>
                                    <div className="flex items-center gap-3 my-5">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-xs text-gray-400">New to Happy Tails?</span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>
                                   <Link
                                    href={route('owner.register')}
                                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl border-2 border-[#D18BB0] text-[#D18BB0] font-bold text-sm hover:bg-[#F8C8DC]/20 hover:border-[#c2799b] transition-all"
                                >
                                    Create an Owner Account
                                </Link>
                                                                </>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
