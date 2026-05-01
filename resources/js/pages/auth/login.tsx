import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { PawPrint, Stethoscope, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    status?: string;
    // Controller can flash which tab was active on a failed login attempt
    activeTab?: 'owner' | 'clinic';
}

type Tab = 'owner' | 'clinic';

const TAB_CONFIG = {
 owner: {
    label:      'Pet Owner',
    icon:       PawPrint,
    postRoute:  'owner.login',
    gradient:   'bg-[#D18BB0]', // main color (your logo)
    gradHov:    'hover:bg-[#c07aa0]', // slightly darker
    shadow:     'shadow-[#D18BB0]',
    ring:       'focus:ring-[#D18BB0] focus:border-[#c07aa0]',
    check:      'text-[#b56b92] focus:ring-[#D18BB0]',
    tabActive:  'border-[#D18BB0] text-[#a85a82] bg-[#f4e4ec]',
    tabInact:   'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
},
    clinic: {
        label:      'Vet Clinic',
        icon:       Stethoscope,
        postRoute:  'clinic.login',
        gradient:   'from-teal-500 to-cyan-500',
        gradHov:    'hover:from-teal-600 hover:to-cyan-600',
        shadow:     'shadow-teal-200',
        ring:       'focus:ring-teal-100 focus:border-teal-400',
        check:      'text-teal-500 focus:ring-teal-400',
        tabActive:  'border-teal-500 text-teal-600 bg-teal-50',
        tabInact:   'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
    },
} as const;

// ─── Inner form — re-mounts on tab change so fields + errors always reset ──────
function LoginForm({ tab }: { tab: Tab }) {
    const cfg = TAB_CONFIG[tab];
    const [showPw, setShowPw] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email:    '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route(cfg.postRoute), { onFinish: () => reset('password') });
    };

    const base = 'w-full py-3 rounded-xl border text-sm bg-white transition-all outline-none';
    const err  = 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100';
    const ok   = `border-gray-200 focus:ring-2 ${cfg.ring}`;

    return (
        <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="email" autoFocus autoComplete="email"
                        value={data.email} onChange={e => setData('email', e.target.value)}
                        placeholder="you@example.com"
                        className={`${base} pl-10 pr-4 ${errors.email ? err : ok}`}
                    />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type={showPw ? 'text' : 'password'} autoComplete="current-password"
                        value={data.password} onChange={e => setData('password', e.target.value)}
                        placeholder="••••••••"
                        className={`${base} pl-10 pr-10 ${errors.password ? err : ok}`}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>}
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)}
                    className={`w-4 h-4 rounded border-gray-300 ${cfg.check}`} />
                <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={processing}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r ${cfg.gradient} ${cfg.gradHov} text-white font-bold text-sm shadow-md ${cfg.shadow} transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0`}>
                {processing
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Signing in…</>
                    : <><LogIn className="w-4 h-4" />Sign In</>
                }
            </button>
        </form>
    );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function HappyTailsLogin({ status, activeTab = 'owner' }: Props) {
    const [tab, setTab] = useState<Tab>(activeTab);
    const cfg  = TAB_CONFIG[tab];
    const Icon = cfg.icon;

    return (
        <>
            <Head title={`${cfg.label} Login — Happy Tails`} />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-teal-50 flex items-center justify-center p-4">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">

                        {/* Gradient header — animates color on tab switch */}
                       <div className={`px-8 pt-8 pb-6 flex flex-col items-center bg-[#F8C8DC] transition-all duration-300`}>
                            <div className="mb-3 flex justify-center">
                            <img
                                src="/images/logo.png"
                                alt="Happy Tails Logo"
                                className="w-16 h-16 object-contain drop-shadow-2xl"
                            />
                        </div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight">Happy Tails</h1>
                            <p className="text-white/70 text-xs mt-0.5">{cfg.label} Portal</p>
                        </div>

                        {/* Tab switcher */}
                        <div className="flex border-b border-gray-100 bg-white">
                            {(['owner', 'clinic'] as Tab[]).map(t => {
                                const tc   = TAB_CONFIG[t];
                                const TIcon = tc.icon;
                                return (
                                    <button key={t} type="button" onClick={() => setTab(t)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-b-2 transition-all ${tab === t ? tc.tabActive : tc.tabInact}`}>
                                        <TIcon className="w-4 h-4" />{tc.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="px-8 py-7">
                            {/* Flash status */}
                            {status && (
                                <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                                    {status}
                                </div>
                            )}

                            {/* Clinic note */}
                            {tab === 'clinic' && (
                                <div className="mb-5 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100">
                                    <p className="text-xs text-teal-700 text-center">
                                        Clinic accounts are created by the Happy Tails administrator.
                                    </p>
                                </div>
                            )}

                            {/* key prop forces full re-mount — clears fields & errors on tab switch */}
                            <LoginForm key={tab} tab={tab} />

                            {/* Register — owners only */}
                            {tab === 'owner' && (
                                <>
                                    <div className="flex items-center gap-3 my-5">
                                        <div className="flex-1 h-px bg-gray-100" />
                                        <span className="text-xs text-gray-400">New to Happy Tails?</span>
                                        <div className="flex-1 h-px bg-gray-100" />
                                    </div>
                                    <Link href={route('owner.register')}
                                        className="w-full flex items-center justify-center py-3 px-4 rounded-xl border-2 border-orange-200 text-orange-600 font-bold text-sm hover:bg-orange-50 hover:border-orange-300 transition-all">
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