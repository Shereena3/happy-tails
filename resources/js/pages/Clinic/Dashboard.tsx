// resources/js/pages/Clinic/Dashboard.tsx
// Rendered by: web.php → Clinic/Dashboard
// API:         GET /api/clinic/dashboard  (PetClinicController::clinicDashboard)
//              GET /api/clinic/reminders/overdue  (ReminderController::getOverdueForClinic)
//              GET /api/clinic/reminders/pending  (ReminderController::getPendingForClinic)

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Stethoscope, PawPrint, Users, Clock, ChevronRight,
    Syringe, Pill, Scissors, AlertCircle, Activity,
} from 'lucide-react';
import ClinicLayout from '@/layouts/app-layout';
import { petClinicService, reminderService } from '@/services/happy-tails';
import type { Reminder } from '@/services/happy-tails/types';

interface ClinicStats {
    total_owners?: number;
    total_pets?: number;
    overdue_reminders?: number;
    pending_reminders?: number;
}

function StatCard({ label, value, icon: Icon, accent, loading }: {
    label: string; 
    value?: number; 
    icon: any; 
    accent: string; 
    loading: boolean;
}) {
    return (
        <div className={`bg-white rounded-2xl p-5 border border-gray-100 border-l-4 ${accent} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                <Icon className="w-[18px] h-[18px] text-teal-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 tabular-nums">
                {loading ? <span className="inline-block w-8 h-7 rounded-lg bg-gray-100 animate-pulse" /> : (value ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
        </div>
    );
}

export default function ClinicDashboard() {
    const [stats, setStats] = useState<ClinicStats>({});
    const [overdueReminders, setOverdueReminders] = useState<Reminder[]>([]);
    const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatsLoading(true);
            
            try {
                // Fetch dashboard stats from clinic endpoint
                const dashboardRes = await petClinicService.getDashboard();
                if (dashboardRes.success && dashboardRes.data) {
                    setStats({
                        total_owners: dashboardRes.data.total_owners,
                        total_pets: dashboardRes.data.total_pets,
                        overdue_reminders: dashboardRes.data.overdue_reminders,
                        pending_reminders: dashboardRes.data.pending_reminders,
                    });
                }
                setStatsLoading(false);

                // Fetch overdue reminders using clinic-specific endpoint
                const overdueRes = await reminderService.getOverdueForClinic();
                if (overdueRes.success && overdueRes.data) {
                    setOverdueReminders(overdueRes.data.slice(0, 8));
                }

                // Fetch pending reminders using clinic-specific endpoint
                const pendingRes = await reminderService.getPendingForClinic();
                if (pendingRes.success && pendingRes.data) {
                    setPendingReminders(pendingRes.data.slice(0, 8));
                }
            } catch (error) {
                console.error('Error loading clinic dashboard:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const isOverdue = (r: Reminder) => new Date(r.remind_at) < new Date();

    const statCards = [
        { label: 'Overdue Reminders', value: stats.overdue_reminders, icon: AlertCircle, accent: 'border-l-red-500' },
        { label: 'All Owners', value: stats.total_owners, icon: Users, accent: 'border-l-teal-500' },
        { label: 'All Pets', value: stats.total_pets, icon: PawPrint, accent: 'border-l-cyan-500' },
        { label: 'Pending Reminders', value: stats.pending_reminders, icon: Clock, accent: 'border-l-amber-500' },
    ];

    // Combine reminders for display (show overdue first, then pending)
    const displayReminders = [...overdueReminders, ...pendingReminders].slice(0, 8);

    return (
        <ClinicLayout>
            <Head title="Clinic Dashboard — Happy Tails" />
            <div className="min-h-screen bg-gray-50/60">

                {/* Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 px-6 py-10">
                    <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
                    <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <p className="text-teal-100 text-sm font-medium mb-1">{greet},</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                                <Stethoscope className="w-7 h-7" /> Clinic Dashboard
                            </h1>
                            <p className="text-teal-100 text-sm mt-1.5">Monitor all pets, owners and health records</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('clinic.owners.index')}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-bold transition-all">
                                <Users className="w-4 h-4" /> Owners
                            </Link>
                            <Link href={route('clinic.pets.index')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-teal-600 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                <PawPrint className="w-4 h-4" /> All Pets
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map(s => (
                            <StatCard key={s.label} {...s} loading={statsLoading} />
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Reminders section */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <h2 className="font-bold text-gray-900 text-sm">Recent Reminders</h2>
                                </div>
                                <Link href={route('clinic.reminders.index')}
                                    className="flex items-center gap-1 text-xs font-semibold text-teal-500 hover:text-teal-700">
                                    View all <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="divide-y divide-gray-50">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-100 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-gray-100 rounded-full w-2/5" />
                                                <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : displayReminders.length === 0 ? (
                                <div className="py-14 text-center px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-6 h-6 text-teal-300" />
                                    </div>
                                    <p className="text-gray-500 text-sm font-semibold">No reminders</p>
                                    <p className="text-gray-400 text-xs mt-1">All pets are up to date 🎉</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {displayReminders.map(r => {
                                        const over = isOverdue(r);
                                        return (
                                            <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${over ? 'bg-red-50' : 'bg-amber-50'}`}>
                                                    <AlertCircle className={`w-5 h-5 ${over ? 'text-red-400' : 'text-amber-400'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={route('clinic.reminders.show', r.id)} className="text-sm font-bold text-gray-900 hover:text-teal-600 truncate block">
                                                        {r.title}
                                                    </Link>
                                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-gray-500">{r.pet?.name}</span>
                                                        <span>•</span>
                                                        <span>{new Date(r.remind_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        {r.pet?.owner && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-teal-500">Owner: {r.pet.owner.name || `${r.pet.owner.first_name} ${r.pet.owner.last_name}`}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${over ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {over ? 'Overdue' : 'Pending'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Quick Access</h3>
                            {[
                                { label: 'Browse All Owners', href: route('clinic.owners.index'), icon: Users, color: 'bg-teal-500 hover:bg-teal-600' },
                                { label: 'Browse All Pets', href: route('clinic.pets.index'), icon: PawPrint, color: 'bg-cyan-500 hover:bg-cyan-600' },
                                { label: 'All Reminders', href: route('clinic.reminders.index'), icon: Clock, color: 'bg-amber-500 hover:bg-amber-600' },
                                { label: 'Clinic Profile', href: route('clinic.profile'), icon: Stethoscope, color: 'bg-indigo-500 hover:bg-indigo-600' },
                            ].map(a => (
                                <Link key={a.href} href={a.href}
                                    className={`${a.color} text-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
                                    <a.icon className="w-5 h-5 opacity-90 shrink-0" />
                                    <span className="text-sm font-bold">{a.label}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ClinicLayout>
    );
}