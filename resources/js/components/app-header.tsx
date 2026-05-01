

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Menu, X, LogOut, ChevronDown, Bell, ChevronRight,
    LayoutDashboard, PawPrint, Clock, User, MapPin,
    Stethoscope, LogIn, Users, AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OwnerAuth {
    id: number;
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    suffix?: string;
    name?: string;
    profile_photo_url?: string;
    email: string;
    is_active: boolean;
}

interface ClinicAuth {
    id: number;
    clinic_name: string;
    profile_photo_url?: string;
    email: string;
    is_active: boolean;
}

interface NotifItem {
    id: number;
    title?: string;
    message: string;
    type?: string;
    reminder_id?: number;
    created_at: string;
}

interface PageProps {
    auth?: {
        owner?:  OwnerAuth | null;
        clinic?: ClinicAuth | null;
    };
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ownerName(o: OwnerAuth | null | undefined): string {
    if (!o) return 'Pet Owner';
    if (o.first_name && o.last_name) {
        const mi  = o.middle_name ? ' ' + o.middle_name.charAt(0) + '.' : '';
        const sfx = o.suffix ? ' ' + o.suffix : '';
        return `${o.first_name}${mi} ${o.last_name}${sfx}`;
    }
    return o.name ?? 'Pet Owner';
}

function ownerInitials(o: OwnerAuth | null | undefined): string {
    if (!o) return '?';
    if (o.first_name && o.last_name)
        return (o.first_name[0] + o.last_name[0]).toUpperCase();
    if (o.name)
        return o.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return '?';
}

function isActive(href: string, path: string): boolean {
    if (path === href) return true;
    // Match sub-paths — but don't let '/' match everything
    if (href === '/') return path === '/';
    return path.startsWith(href + '/') || path === href;
}

function notifDot(type?: string): string {
    switch (type) {
        case 'vaccination_due': return 'bg-blue-400';
        case 'medicine_due':    return 'bg-green-400';
        case 'grooming_due':    return 'bg-pink-400';
        case 'vet_visit_due':   return 'bg-purple-400';
        default:                return 'bg-[#E07A5F]';
    }
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({
    photoUrl, initials, size = 'md', isClinic = false, className = '',
}: {
    photoUrl?: string | null; initials: string;
    size?: 'sm' | 'md' | 'lg'; isClinic?: boolean; className?: string;
}) {
    const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size];
    const base = `${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`;
    if (photoUrl) return <img src={photoUrl} alt={initials} className={`${base} object-cover`} />;
    return (
        <div className={`${base} text-white`} style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}>
            {isClinic ? <Stethoscope className="w-4 h-4" /> : initials}
        </div>
    );
}

function Logo({ isOwner, isClinic }: { isOwner?: boolean; isClinic?: boolean }) {
    const href = isOwner
        ? route('owner.dashboard')
        : isClinic
        ? route('clinic.dashboard')
        : '/';

    return (
        <Link href={href} className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}>
                <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-widest uppercase" style={{ color: '#E07A5F', letterSpacing: '0.12em' }}>
                    Happy Tails
                </span>
                <span className="text-[10px] font-medium" style={{ color: '#C8958A' }}>
                    Your Pet's Digital Booklet
                </span>
            </div>
        </Link>
    );
}

// ─── Nav configs ────────────────────────────────────────────────────────────────

const OWNER_NAV = [
    { title: 'Dashboard',  href: '/owner/dashboard', icon: LayoutDashboard },
    { title: 'My Pets',    href: '/owner/pets',      icon: PawPrint        },
    { title: 'Reminders',  href: '/owner/reminders', icon: Clock           },
    { title: 'Clinics',    href: '/clinics',         icon: MapPin          },
];

const CLINIC_NAV = [
    { title: 'Dashboard', href: '/clinic/dashboard', icon: LayoutDashboard },
    { title: 'Owners',    href: '/clinic/owners',    icon: Users           },
    { title: 'Pets',      href: '/clinic/pets',      icon: PawPrint        },
    { title: 'Reminders', href: '/clinic/reminders', icon: AlertCircle     },
    { title: 'Profile',   href: '/clinic/profile',   icon: Stethoscope     },
];

const GUEST_NAV = [
    { title: 'Home',         href: '/',            icon: LayoutDashboard },
    { title: 'How It Works', href: '/how-it-works', icon: PawPrint        },
    { title: 'Pet Tracking', href: '/pet-tracking', icon: PawPrint        },
    { title: 'Contact',      href: '/contact',      icon: MapPin          },
];

// ─── Main ───────────────────────────────────────────────────────────────────────

function AppHeader() {
    const pageProps = usePage<PageProps>().props;
    const auth      = pageProps.auth;

    // Determine role from shared auth prop
    const owner  = auth?.owner  ?? null;
    const clinic = auth?.clinic ?? null;

    const isOwner  = !!owner;
    const isClinic = !!clinic && !owner;  // clinic guard — not owner guard
    const isGuest  = !isOwner && !isClinic;

    // ── State ──────────────────────────────────────────────────────────────────
    const [mobileOpen,  setMobileOpen]  = useState(false);
    const [userOpen,    setUserOpen]    = useState(false);
    const [notifOpen,   setNotifOpen]   = useState(false);
    const [scrolled,    setScrolled]    = useState(false);
    const [notifCount,  setNotifCount]  = useState(0);
    const [notifItems,  setNotifItems]  = useState<NotifItem[]>([]);
    const [badgePulse,  setBadgePulse]  = useState(false);

    const userRef  = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const prevRef  = useRef(0);

    // ── Poll notifications (owner only, every 30s) ─────────────────────────────
    const pollNotifs = useCallback(async () => {
        if (!isOwner) return;
        try {
            const res = await fetch('/api/owner/notifications/unread-count', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const json = await res.json();
            if (!json.success) return;
            const count: number = json.count ?? 0;
            const items: NotifItem[] = json.items ?? [];
            if (count > prevRef.current) {
                setBadgePulse(true);
                setTimeout(() => setBadgePulse(false), 1400);
            }
            prevRef.current = count;
            setNotifCount(count);
            setNotifItems(items);
        } catch { /* silent */ }
    }, [isOwner]);

    useEffect(() => {
        pollNotifs();
        const id = setInterval(pollNotifs, 30_000);
        return () => clearInterval(id);
    }, [pollNotifs]);

    // ── Scroll shadow ──────────────────────────────────────────────────────────
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    // ── Click outside to close dropdowns ──────────────────────────────────────
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    // ── Body scroll lock on mobile menu ───────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // ── Logout ─────────────────────────────────────────────────────────────────
    const handleLogout = () => {
        Swal.fire({
            title: 'Sign out?',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#E07A5F',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Yes, sign out',
            iconColor: '#E07A5F',
        }).then(r => {
            if (!r.isConfirmed) return;
            const logoutRoute = isOwner ? '/owner/logout' : '/clinic/logout';
            router.post(logoutRoute);
        });
    };

    // ── Derived values ─────────────────────────────────────────────────────────
    const navItems    = isOwner ? OWNER_NAV : isClinic ? CLINIC_NAV : GUEST_NAV;
    const hasUnread   = notifCount > 0;
    const pathname    = typeof window !== 'undefined' ? window.location.pathname : '';

    const displayName     = isOwner  ? ownerName(owner) : isClinic ? clinic!.clinic_name : '';
    const displayInitials = isOwner  ? ownerInitials(owner) : isClinic ? (clinic!.clinic_name[0] ?? 'C').toUpperCase() : '?';
    const displayEmail    = isOwner  ? owner!.email : isClinic ? clinic!.email : '';
    const displayPhoto    = isOwner  ? owner?.profile_photo_url : clinic?.profile_photo_url;
    const roleLabel       = isOwner  ? 'Pet Owner' : isClinic ? 'Vet Clinic' : '';
    const profileHref     = isOwner  ? '/owner/profile' : '/clinic/profile';

    // ── Shared nav link classes ────────────────────────────────────────────────
    const navLinkStyle = (href: string) => ({
        color: isActive(href, pathname) ? '#E07A5F' : '#8B5E52',
        fontWeight: isActive(href, pathname) ? 600 : 500,
    });

    return (
        <>
            {/* ════════════════════════ HEADER ════════════════════════ */}
            <header className="sticky top-0 z-50 w-full bg-white transition-all duration-300"
                style={{
                    borderBottom: scrolled ? 'none' : '1px solid #F5E6E0',
                    boxShadow:    scrolled ? '0 2px 20px rgba(224,122,95,0.12)' : 'none',
                }}>
                <div className="px-5 sm:px-8 lg:px-12">
                    <div className="flex h-16 sm:h-[70px] items-center justify-between gap-6">

                        {/* Logo */}
                       <Logo isOwner={isOwner} isClinic={isClinic} />

                        {/* Desktop nav — center */}
                        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                            {navItems.map((item, i) => {
                                const active = isActive(item.href, pathname);
                                return (
                                    <Link key={i} href={item.href}
                                        className="relative px-4 py-2 text-sm rounded-lg transition-all duration-150"
                                        style={navLinkStyle(item.href)}>
                                        {item.title}
                                        {/* Active dot */}
                                        {active && (
                                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                                style={{ background: '#E07A5F' }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">

                            {/* ── GUEST ── */}
                            {isGuest && (
                                <>
                                    <Link href="/owner/login"
                                        className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                                        style={{ color: '#E07A5F' }}>
                                        <LogIn className="w-4 h-4" /> Login
                                    </Link>
                                    <Link href="/owner/register"
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-full shadow-sm hover:opacity-90 transition-opacity"
                                        style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}>
                                        <PawPrint className="w-4 h-4" /> Get Started
                                    </Link>
                                </>
                            )}

                            {/* ── AUTHENTICATED ── */}
                            {!isGuest && (
                                <>
                                    {/* Bell — owner only */}
                                    {isOwner && (
                                        <div className="relative" ref={notifRef}>
                                            <button
                                                onClick={() => { setNotifOpen(v => !v); pollNotifs(); }}
                                                className="relative p-2.5 rounded-full border transition-all"
                                                style={{ border: '1px solid #F5E6E0', color: '#8B5E52' }}>
                                                <Bell className="w-5 h-5" />
                                                {hasUnread && (
                                                    <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ring-2 ring-white ${badgePulse ? 'animate-bounce' : ''}`}
                                                        style={{ background: '#E07A5F' }}>
                                                        {notifCount > 9 ? '9+' : notifCount}
                                                    </span>
                                                )}
                                            </button>

                                            {/* Notification dropdown */}
                                            {notifOpen && (
                                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
                                                    style={{ border: '1px solid #F5E6E0' }}>
                                                    {/* Dropdown header */}
                                                    <div className="px-4 py-3 flex items-center justify-between"
                                                        style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}>
                                                        <div className="flex items-center gap-2">
                                                            <Bell className="w-4 h-4 text-white" />
                                                            <span className="text-white font-bold text-sm">Notifications</span>
                                                        </div>
                                                        {hasUnread && (
                                                            <span className="px-2 py-0.5 bg-white/25 text-white text-xs font-black rounded-full border border-white/30">
                                                                {notifCount} unread
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Items */}
                                                    <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: '#F5E6E0' }}>
                                                        {notifItems.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-10" style={{ color: '#C8958A' }}>
                                                                <PawPrint className="w-10 h-10 mb-2 opacity-25" />
                                                                <p className="text-sm font-medium">All caught up!</p>
                                                                <p className="text-xs mt-0.5">No new notifications</p>
                                                            </div>
                                                        ) : notifItems.slice(0, 6).map(n => (
                                                            <div key={n.id} className="px-4 py-3 hover:bg-[#FDF0EC] transition-colors">
                                                                <div className="flex items-start gap-2.5">
                                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${notifDot(n.type)}`} />
                                                                    <div className="flex-1 min-w-0">
                                                                        {n.title && (
                                                                            <p className="text-xs font-bold leading-snug" style={{ color: '#5C3D35' }}>{n.title}</p>
                                                                        )}
                                                                        <p className="text-sm font-medium leading-snug line-clamp-2 mt-0.5" style={{ color: '#8B5E52' }}>
                                                                            {n.message}
                                                                        </p>
                                                                        <p className="text-[10px] mt-1" style={{ color: '#C8958A' }}>
                                                                            {timeAgo(n.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="p-2" style={{ borderTop: '1px solid #F5E6E0' }}>
                                                        <Link href="/owner/notifications" onClick={() => setNotifOpen(false)}
                                                            className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#FDF0EC] transition-colors"
                                                            style={{ color: '#E07A5F' }}>
                                                            View all <ChevronRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* User dropdown */}
                                    <div className="relative" ref={userRef}>
                                        <button onClick={() => setUserOpen(v => !v)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-full border hover:shadow-sm transition-all"
                                            style={{ border: '1px solid #F5E6E0' }}>
                                            <div className="relative">
                                                <Avatar photoUrl={displayPhoto} initials={displayInitials} size="sm" isClinic={isClinic} />
                                                {isOwner && hasUnread && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                                                        style={{ background: '#E07A5F' }} />
                                                )}
                                            </div>
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-bold leading-none truncate max-w-[120px]" style={{ color: '#5C3D35' }}>
                                                    {displayName}
                                                </p>
                                                <p className="text-xs font-medium mt-0.5" style={{ color: '#C8958A' }}>
                                                    {roleLabel}
                                                </p>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${userOpen ? 'rotate-180' : ''}`}
                                                style={{ color: '#C8958A' }} />
                                        </button>

                                        {/* User dropdown panel */}
                                        {userOpen && (
                                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl overflow-hidden z-50"
                                                style={{ border: '1px solid #F5E6E0' }}>

                                                {/* Profile card in dropdown */}
                                                <div className="px-4 py-4"
                                                    style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar photoUrl={displayPhoto} initials={displayInitials} size="lg"
                                                            className="border-2 border-white/40 shadow-md" isClinic={isClinic} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-bold text-sm truncate">{displayName}</p>
                                                            <p className="text-white/75 text-xs truncate">{displayEmail}</p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full border border-white/30">
                                                                    {roleLabel}
                                                                </span>
                                                                {isOwner && hasUnread && (
                                                                    <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-black rounded-full border border-white/30">
                                                                        {notifCount} unread
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu items */}
                                                <div className="py-1">
                                                    {/* Owner links */}
                                                    {isOwner && (
                                                        <>
                                                            {[
                                                                { href: '/owner/profile',       icon: User,    label: 'My Profile'     },
                                                                { href: '/owner/pets',          icon: PawPrint,label: 'My Pets'        },
                                                                { href: '/owner/reminders',     icon: Clock,   label: 'Reminders'      },
                                                            ].map(item => (
                                                                <Link key={item.href} href={item.href}
                                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[#FDF0EC] transition-colors"
                                                                    style={{ color: '#5C3D35' }}
                                                                    onClick={() => setUserOpen(false)}>
                                                                    <item.icon className="w-4 h-4" style={{ color: '#E07A5F' }} />
                                                                    {item.label}
                                                                </Link>
                                                            ))}
                                                            {/* Notifications with badge */}
                                                            <Link href="/owner/notifications"
                                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[#FDF0EC] transition-colors"
                                                                style={{ color: '#5C3D35' }}
                                                                onClick={() => setUserOpen(false)}>
                                                                <Bell className="w-4 h-4" style={{ color: '#E07A5F' }} />
                                                                <span className="flex-1">Notifications</span>
                                                                {hasUnread && (
                                                                    <span className="inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full text-[10px] font-black text-white"
                                                                        style={{ background: '#E07A5F' }}>
                                                                        {notifCount > 9 ? '9+' : notifCount}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        </>
                                                    )}

                                                    {/* Clinic links */}
                                                    {isClinic && (
                                                        <>
                                                            {[
                                                                { href: '/clinic/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
                                                                { href: '/clinic/owners',    icon: Users,           label: 'Pet Owners'  },
                                                                { href: '/clinic/pets',      icon: PawPrint,        label: 'All Pets'    },
                                                                { href: '/clinic/profile',   icon: Stethoscope,     label: 'Clinic Profile' },
                                                            ].map(item => (
                                                                <Link key={item.href} href={item.href}
                                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[#FDF0EC] transition-colors"
                                                                    style={{ color: '#5C3D35' }}
                                                                    onClick={() => setUserOpen(false)}>
                                                                    <item.icon className="w-4 h-4" style={{ color: '#E07A5F' }} />
                                                                    {item.label}
                                                                </Link>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Sign out */}
                                                <div style={{ borderTop: '1px solid #F5E6E0' }}>
                                                    <button onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-red-50 transition-colors"
                                                        style={{ color: '#DC2626' }}>
                                                        <LogOut className="w-4 h-4" /> Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Mobile hamburger */}
                            <button onClick={() => setMobileOpen(v => !v)}
                                className="lg:hidden relative p-2.5 rounded-full border transition-all"
                                style={{ border: '1px solid #F5E6E0', color: '#8B5E52' }}>
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                {/* Unread dot on hamburger */}
                                {!mobileOpen && isOwner && hasUnread && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                                        style={{ background: '#E07A5F' }} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ════════════════════════ MOBILE OVERLAY ════════════════════════ */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* ════════════════════════ MOBILE SIDEBAR ════════════════════════ */}
            <div className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
                mobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-5 space-y-4">
                    {/* Close */}
                    <button onClick={() => setMobileOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full"
                        style={{ background: '#FDF0EC', color: '#E07A5F' }}>
                        <X className="w-5 h-5" />
                    </button>

                    {/* Auth card */}
                    {!isGuest ? (
                        <div className="rounded-2xl p-4 mt-8 shadow-sm"
                            style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}>
                            <div className="flex items-center gap-3">
                                <Avatar photoUrl={displayPhoto} initials={displayInitials} size="lg"
                                    className="border-2 border-white/40" isClinic={isClinic} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{displayName}</p>
                                    <p className="text-white/75 text-xs truncate">{displayEmail}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full border border-white/30">
                                        {roleLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                                                <div className="mt-8">
                            <Logo isOwner={isOwner} isClinic={isClinic} />
                        </div>
                    )}

                    {/* Nav links */}
                    <div className="space-y-1 pt-2">
                        {navItems.map((item, i) => {
                            const active = isActive(item.href, pathname);
                            return (
                                <Link key={i} href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        background: active ? 'linear-gradient(135deg,#F2A58E,#E07A5F)' : 'transparent',
                                        color: active ? '#fff' : '#5C3D35',
                                    }}
                                    onClick={() => setMobileOpen(false)}>
                                    <item.icon className="w-5 h-5" />
                                    <span className="flex-1">{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom actions */}
                    <div className="pt-3 space-y-1" style={{ borderTop: '1px solid #F5E6E0' }}>
                        {isGuest ? (
                            <>
                                <Link href="/owner/login"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                                    style={{ color: '#E07A5F' }}
                                    onClick={() => setMobileOpen(false)}>
                                    <LogIn className="w-5 h-5" /> Login
                                </Link>
                                <Link href="/owner/register"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg,#F2A58E,#E07A5F)' }}
                                    onClick={() => setMobileOpen(false)}>
                                    <PawPrint className="w-5 h-5" /> Get Started
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href={profileHref}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#FDF0EC] transition-colors"
                                    style={{ color: '#5C3D35' }}
                                    onClick={() => setMobileOpen(false)}>
                                    {isClinic ? <Stethoscope className="w-5 h-5" style={{ color: '#E07A5F' }} /> : <User className="w-5 h-5" style={{ color: '#E07A5F' }} />}
                                    {isClinic ? 'Clinic Profile' : 'My Profile'}
                                </Link>
                                {isOwner && (
                                    <Link href="/owner/notifications"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#FDF0EC] transition-colors"
                                        style={{ color: '#5C3D35' }}
                                        onClick={() => setMobileOpen(false)}>
                                        <Bell className="w-5 h-5" style={{ color: '#E07A5F' }} />
                                        <span className="flex-1">Notifications</span>
                                        {hasUnread && (
                                            <span className="inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full text-[10px] font-black text-white"
                                                style={{ background: '#E07A5F' }}>
                                                {notifCount > 9 ? '9+' : notifCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <button onClick={() => { setMobileOpen(false); handleLogout(); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                                    style={{ color: '#DC2626' }}>
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Support both:
//   import AppHeader from '@/components/app-header'         ← default
//   import { AppHeader } from '@/components/app-header'    ← named
export { AppHeader };
export default AppHeader;