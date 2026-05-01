

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    PawPrint, Bell, Plus, ChevronRight, Stethoscope,
    Syringe, Pill, Scissors, Clock, AlertCircle,
    MapPin, Phone, Activity,
} from 'lucide-react';
import OwnerLayout from  '@/layouts/app-layout';
import { petOwnerService, reminderService, notificationService } from '@/services/happy-tails';
import type { DashboardData, OwnerDashboardStats } from '@/services/happy-tails/types';

function StatCard({ label, value, icon: Icon, accent, loading }: {
    label: string; value?: number; icon: any; accent: string; loading: boolean;
}) {
    return (
        <div className={`bg-white rounded-2xl p-5 border border-gray-100 border-l-4 ${accent} shadow-sm`}>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <Icon className="w-[18px] h-[18px] text-orange-500" />
            </div>
            <p className="text-2xl font-black text-gray-900 tabular-nums">
                {loading ? <span className="inline-block w-8 h-7 rounded-lg bg-gray-100 animate-pulse" /> : (value ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
        </div>
    );
}

export default function OwnerDashboard() {
    const [data,    setData]    = useState<DashboardData | null>(null);
    const [unread,  setUnread]  = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [dashRes, notifRes] = await Promise.all([
                petOwnerService.getDashboard(),
                notificationService.getUnreadCount(),
            ]);
            if (dashRes.success && dashRes.data) setData(dashRes.data);
            if (notifRes.success && notifRes.data) setUnread(notifRes.data.count);
            setLoading(false);
        })();
    }, []);

    const stats = data?.stats;
    const owner = data?.owner;
    const hour  = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const statCards = [
        { label: 'Total Pets',         value: stats?.total_pets,              icon: PawPrint,  accent: 'border-l-orange-500' },
        { label: 'Vaccinations',        value: stats?.total_vaccinations,      icon: Syringe,   accent: 'border-l-blue-500'   },
        { label: 'Medicines',           value: stats?.total_medicines,         icon: Pill,      accent: 'border-l-green-500'  },
        { label: 'Pending Reminders',   value: stats?.pending_reminders,       icon: Clock,     accent: 'border-l-amber-500'  },
    ];

    return (
        <OwnerLayout>
            <Head title="Dashboard — Happy Tails" />

            <div className="min-h-screen bg-gray-50/60">
                {/* Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-6 py-10">
                    <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />

                    <div className="relative max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">{greet},</p>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                {owner?.first_name ?? 'Pet Owner'} 🐾
                            </h1>
                            <p className="text-orange-100 text-sm mt-1">Manage your pets' health & wellness</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route('owner.notifications.index')}
                                className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 transition-all">
                                <Bell className="w-5 h-5 text-white" />
                                {unread > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unread > 9 ? '9+' : unread}
                                    </span>
                                )}
                            </Link>
                            <Link href={route('owner.pets.create')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-orange-600 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                <Plus className="w-4 h-4" /> Add Pet
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map(s => (
                            <StatCard key={s.label} {...s} loading={loading} />
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* My Pets */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <PawPrint className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <h2 className="font-bold text-gray-900 text-sm">My Pets</h2>
                                </div>
                                <Link href={route('owner.pets.index')} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-700">
                                    View all <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="divide-y divide-gray-50">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-gray-100 rounded-full w-1/3" />
                                                <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !data?.pets?.length ? (
                                <div className="py-14 text-center px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                        <PawPrint className="w-6 h-6 text-orange-300" />
                                    </div>
                                    <p className="text-gray-500 text-sm font-semibold">No pets yet</p>
                                    <p className="text-gray-400 text-xs mt-1 mb-4">Add your first pet to get started</p>
                                    <Link href={route('owner.pets.create')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors">
                                        <Plus className="w-3.5 h-3.5" /> Add Pet
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {data.pets.slice(0, 5).map(pet => (
                                        <Link key={pet.id} href={route('owner.pets.show', pet.id)}
                                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition-colors group">
                                            <div className="flex items-center gap-4">
                                               {pet.photo_path ? (
                                                <img src={`/storage/${pet.photo_path}`} alt={pet.name}
                                                    className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-gray-100" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                                    <PawPrint className="w-5 h-5 text-orange-400" />
                                                </div>
                                            )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{pet.name}</p>
                                                   <div className="text-xs text-gray-400 mt-0.5 space-y-0.5 capitalize">
                                                        <p><span className="font-semibold text-gray-600">Breed:</span> {pet.breed ?? 'Unknown'}</p>
                                                        <p><span className="font-semibold text-gray-600">Age:</span> {pet.age_string}</p>
                                                        <p><span className="font-semibold text-gray-600">Gender:</span> {pet.sex ?? 'Unknown'}</p>
                                                </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Upcoming Reminders */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">Upcoming Reminders</h3>
                                </div>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : !data?.upcoming_reminders?.length ? (
                                    <p className="text-xs text-gray-400 text-center py-4">No upcoming reminders</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.upcoming_reminders.slice(0, 4).map(r => (
                                            <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{r.title}</p>
                                                    <p className="text-[10px] text-gray-400">{r.pet?.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Link href={route('owner.reminders.index')}
                                    className="w-full mt-3 flex items-center justify-center py-2 rounded-xl border border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 transition-colors">
                                    View All Reminders
                                </Link>
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Add Pet',         href: route('owner.pets.create'),         icon: Plus,        color: 'bg-orange-500 hover:bg-orange-600'    },
                                    { label: 'Reminders',       href: route('owner.reminders.index'),     icon: Clock,       color: 'bg-amber-500 hover:bg-amber-600'      },
                                    { label: 'Notifications',   href: route('owner.notifications.index'), icon: Bell,        color: 'bg-violet-500 hover:bg-violet-600', badge: unread },
                                    { label: 'Profile',         href: route('owner.profile'),             icon: Activity,    color: 'bg-teal-500 hover:bg-teal-600'        },
                                ].map(a => (
                                    <Link key={a.href} href={a.href}
                                        className={`${a.color} text-white rounded-xl p-3 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 relative`}>
                                        <a.icon className="w-4 h-4 opacity-90" />
                                        <span className="text-[11px] font-bold leading-snug">{a.label}</span>
                                        {(a as any).badge > 0 && (
                                            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                                {(a as any).badge > 9 ? '9+' : (a as any).badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
