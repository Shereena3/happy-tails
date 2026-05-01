// resources/js/pages/Owner/Notifications/Show.tsx
// API: GET /api/owner/notifications/{id}  (auto-marks as read on server)

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Bell, ChevronLeft, Clock, Syringe, Pill,
    Scissors, Stethoscope, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react';
import OwnerLayout from '@/layouts/owner-layout';
import { notificationService } from '@/services/happy-tails';
import type { Notification, NotificationType } from '@/services/happy-tails/types';

const TYPE_CFG: Record<NotificationType | string, {
    icon: any; iconColor: string; iconBg: string;
    headerBg: string; label: string; description: string;
}> = {
    reminder_due: {
        icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-100',
        headerBg: 'from-amber-500 to-orange-500',
        label: 'Reminder Due',
        description: 'A reminder you set for your pet is coming up.',
    },
    vaccination_due: {
        icon: Syringe, iconColor: 'text-blue-600', iconBg: 'bg-blue-100',
        headerBg: 'from-blue-500 to-indigo-600',
        label: 'Vaccination Due',
        description: "Your pet's vaccination is due. Schedule a vet visit soon.",
    },
    medicine_due: {
        icon: Pill, iconColor: 'text-green-600', iconBg: 'bg-green-100',
        headerBg: 'from-green-500 to-emerald-600',
        label: 'Medicine Due',
        description: "Time to administer your pet's medicine.",
    },
    grooming_due: {
        icon: Scissors, iconColor: 'text-pink-600', iconBg: 'bg-pink-100',
        headerBg: 'from-pink-500 to-rose-500',
        label: 'Grooming Due',
        description: "Your pet's grooming session is due.",
    },
    vet_visit_due: {
        icon: Stethoscope, iconColor: 'text-purple-600', iconBg: 'bg-purple-100',
        headerBg: 'from-purple-500 to-violet-600',
        label: 'Vet Visit Due',
        description: "It's time for your pet's vet visit.",
    },
    general: {
        icon: Bell, iconColor: 'text-gray-500', iconBg: 'bg-gray-100',
        headerBg: 'from-gray-500 to-gray-600',
        label: 'Notification',
        description: 'You have a new notification from Happy Tails.',
    },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function NotificationShow() {
    const { notificationId } = usePage<{ props: { notificationId: string } }>().props;
    const [notif,   setNotif]   = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            // getNotification auto-marks as read on the server
            const res = await notificationService.getNotification(Number(notificationId));
            if (res.success && res.data) setNotif(res.data);
            setLoading(false);
        })();
    }, [notificationId]);

    if (loading) return (
        <OwnerLayout>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-300" />
            </div>
        </OwnerLayout>
    );

    if (!notif) return (
        <OwnerLayout>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-bold">Notification not found</p>
                    <Link href={route('owner.notifications.index')}
                        className="text-orange-500 text-sm font-semibold mt-2 inline-block hover:underline">
                        ← Back to Notifications
                    </Link>
                </div>
            </div>
        </OwnerLayout>
    );

    const cfg  = TYPE_CFG[notif.type] ?? TYPE_CFG.general;
    const Icon = cfg.icon;

    const receivedAt = new Date(notif.created_at).toLocaleDateString('en-PH', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    // Grab related pet from reminder if available
    const petName = (notif as any).reminder?.pet?.name;
    const petId   = (notif as any).reminder?.pet?.id;

    return (
        <OwnerLayout>
            <Head title={notif.title} />
            <div className="min-h-screen bg-slate-50">

                {/* Coloured header */}
                <div className={`bg-gradient-to-r ${cfg.headerBg} text-white`}>
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                        <Link href={route('owner.notifications.index')}
                            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-semibold mb-5 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Notifications
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{cfg.label}</p>
                                <h1 className="text-xl font-black text-white leading-tight">{notif.title}</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                    {/* Message card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Message</p>
                            <p className="text-gray-800 text-sm leading-relaxed font-medium">{notif.message}</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{receivedAt}</span>
                                <span className="text-gray-300">·</span>
                                <span>{timeAgo(notif.created_at)}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                notif.is_read
                                    ? 'bg-gray-100 text-gray-500 border-gray-200'
                                    : 'bg-orange-50 text-orange-600 border-orange-200'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${notif.is_read ? 'bg-gray-400' : 'bg-orange-500'}`} />
                                {notif.is_read ? 'Read' : 'Unread'}
                            </span>
                        </div>
                    </div>

                    {/* What this means */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What this means</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{cfg.description}</p>

                        {petName && (
                            <div className="mt-4 flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3.5">
                                <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                                <p className="text-xs text-orange-800 font-medium">
                                    This reminder is for <strong>{petName}</strong>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Related pet CTA */}
                    {petId && (
                        <Link href={route('owner.pets.show', petId)}
                            className="flex items-center justify-between bg-white rounded-2xl border border-orange-100 shadow-sm p-5 hover:border-orange-300 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                    <Bell className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">View {petName}'s Profile</p>
                                    <p className="text-xs text-gray-400 mt-0.5">See health records and upcoming reminders</p>
                                </div>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors rotate-180 shrink-0" />
                        </Link>
                    )}

                    {/* Back */}
                    <div className="flex items-center gap-3">
                        <Link href={route('owner.notifications.index')}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                            ← All Notifications
                        </Link>
                        <Link href={route('owner.reminders.index')}
                            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">
                            View Reminders
                        </Link>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
