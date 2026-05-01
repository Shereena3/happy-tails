// resources/js/pages/Owner/Notifications/Index.tsx
// API: GET /api/owner/notifications
//      POST /api/owner/notifications/mark-all-read
//      DELETE /api/owner/notifications/{id}

import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Bell, CheckCheck, Inbox, Trash2,
    Syringe, Pill, Scissors, Clock,
    Stethoscope, ChevronRight, Loader2,
} from 'lucide-react';
import OwnerLayout from '@/layouts/owner-layout';
import { notificationService } from '@/services/happy-tails';
import type { Notification, NotificationType } from '@/services/happy-tails/types';

// Maps notification types to icons + colors
const TYPE_CFG: Record<NotificationType | string, { icon: any; iconColor: string; iconBg: string; accent: string }> = {
    reminder_due:     { icon: Clock,        iconColor: 'text-amber-600',  iconBg: 'bg-amber-50',  accent: 'border-l-amber-400'  },
    vaccination_due:  { icon: Syringe,      iconColor: 'text-blue-600',   iconBg: 'bg-blue-50',   accent: 'border-l-blue-400'   },
    medicine_due:     { icon: Pill,         iconColor: 'text-green-600',  iconBg: 'bg-green-50',  accent: 'border-l-green-400'  },
    grooming_due:     { icon: Scissors,     iconColor: 'text-pink-600',   iconBg: 'bg-pink-50',   accent: 'border-l-pink-400'   },
    vet_visit_due:    { icon: Stethoscope,  iconColor: 'text-purple-600', iconBg: 'bg-purple-50', accent: 'border-l-purple-400' },
    general:          { icon: Bell,         iconColor: 'text-gray-500',   iconBg: 'bg-gray-50',   accent: 'border-l-gray-300'   },
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
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OwnerNotifications() {
    const [all,       setAll]       = useState<Notification[]>([]);
    const [displayed, setDisplayed] = useState<Notification[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [marking,   setMarking]   = useState(false);
    const [tab,       setTab]       = useState<'all' | 'unread'>('all');

    const load = async () => {
        setLoading(true);
        const res = await notificationService.getNotifications({ per_page: 100 });
        if (res.success && res.data) setAll(res.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        setDisplayed(tab === 'unread' ? all.filter(n => !n.is_read) : all);
    }, [tab, all]);

    const unreadCount = all.filter(n => !n.is_read).length;

    const markRead = async (id: number) => {
        await notificationService.markAsRead(id);
        setAll(p => p.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    };

    const markAllRead = async () => {
        setMarking(true);
        await notificationService.markAllAsRead();
        setAll(p => p.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        setMarking(false);
    };

    const remove = async (id: number) => {
        await notificationService.deleteNotification(id);
        setAll(p => p.filter(n => n.id !== id));
    };

    return (
        <OwnerLayout>
            <Head title="Notifications — Happy Tails" />
            <div className="min-h-screen bg-gray-50/60">

                {/* Sticky header */}
                <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Bell className="w-[18px] h-[18px] text-orange-500" />
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-base font-black text-gray-900 leading-none">Notifications</h1>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} disabled={marking}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-colors">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    {marking ? 'Marking…' : 'Mark all read'}
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-3 w-fit">
                            {(['all', 'unread'] as const).map(t => (
                                <button key={t} onClick={() => setTab(t)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                        tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}>
                                    {t}
                                    {t === 'unread' && unreadCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        {loading ? (
                            <div className="divide-y divide-gray-50">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-start gap-4 px-6 py-5 animate-pulse">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3.5 bg-gray-100 rounded-full w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded-full w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                        ) : displayed.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                    <Inbox className="w-7 h-7 text-gray-300" />
                                </div>
                                <p className="text-gray-600 font-bold text-sm">
                                    {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    {tab === 'unread' ? "You're all caught up!" : 'Reminders and health alerts will appear here.'}
                                </p>
                                {tab === 'unread' && (
                                    <button onClick={() => setTab('all')}
                                        className="mt-4 text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors">
                                        View all →
                                    </button>
                                )}
                            </div>

                        ) : (
                            <div className="divide-y divide-gray-50">
                                {displayed.map(notif => {
                                    const cfg  = TYPE_CFG[notif.type] ?? TYPE_CFG.general;
                                    const Icon = cfg.icon;
                                    const isUnread = !notif.is_read;

                                    return (
                                        <div key={notif.id}
                                            className={`flex items-start gap-4 px-5 py-4 border-l-4 transition-colors group ${
                                                isUnread
                                                    ? `${cfg.accent} bg-orange-50/20 hover:bg-orange-50/40`
                                                    : 'border-l-transparent hover:bg-gray-50/60'
                                            }`}>

                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                                                <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link href={route('owner.notifications.show', notif.id)}
                                                        className={`text-sm text-gray-900 leading-snug hover:text-orange-600 transition-colors ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                                                        {notif.title}
                                                    </Link>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(notif.created_at)}</span>
                                                        {isUnread && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>

                                                <div className="flex items-center gap-3 mt-2.5">
                                                    <Link href={route('owner.notifications.show', notif.id)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors">
                                                        View detail <ChevronRight className="w-3 h-3" />
                                                    </Link>
                                                    {isUnread && (
                                                        <button onClick={() => markRead(notif.id)}
                                                            className="text-xs font-semibold text-gray-400 hover:text-orange-500 transition-colors">
                                                            Mark read
                                                        </button>
                                                    )}
                                                    <button onClick={() => remove(notif.id)}
                                                        className="text-xs font-semibold text-gray-300 hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {!loading && displayed.length > 0 && (
                        <p className="text-center text-xs text-gray-400 mt-4">
                            {displayed.length} notification{displayed.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
}
