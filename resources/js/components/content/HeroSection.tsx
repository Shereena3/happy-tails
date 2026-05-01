import { Link } from '@inertiajs/react';
import { Bell, MapPin, ChevronRight, Syringe,  UtensilsCrossed } from 'lucide-react';

interface HeroSectionProps {
    isLoaded: boolean;
}

export default function HeroSection({ isLoaded }: HeroSectionProps) {
    const reminders = [
        { emoji: '💉', label: "Max's Rabies Booster",   due: 'Due in 2 days',  color: '#F4A8B8', bg: '#FFF0F3' },
        { emoji: '✂️', label: "Fluffy's Grooming",       due: 'Due tomorrow',   color: '#E8856A', bg: '#FFF4F0' },
        { emoji: '💊', label: "Luna's Deworming Meds",   due: 'Due in 5 days',  color: '#A8C5DA', bg: '#F0F7FF' },
        { emoji: '🍽️', label: "Max's Evening Feeding",   due: 'Today, 6:00 PM', color: '#A8D9A8', bg: '#F0FFF0' },
    ];

    const clinics = [
        { name: 'Paws & Claws Vet Clinic', dist: '0.3 km', open: true  },
        { name: 'Happy Pets Animal Care',   dist: '0.9 km', open: true  },
        { name: 'Dr. Garcia Vet Clinic',    dist: '1.4 km', open: false },
    ];

    const transitionBase = 'opacity 0.7s ease, transform 0.7s ease';

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #FFE8E0 0%, #FFF0E8 45%, #FFF8F2 100%)' }}
        >
            {/* Decorative blobs */}
            <div className="absolute top-20 -right-20 w-72 h-72 rounded-full pointer-events-none opacity-40"
                style={{ background: 'radial-gradient(circle, #F4A8B8 0%, transparent 70%)' }} />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(circle, #FDDBC8 0%, transparent 70%)' }} />
            <div className="absolute top-40 left-1/3 w-40 h-40 rounded-full pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(circle, #F4A8B8 0%, transparent 70%)' }} />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* ── LEFT COPY ── */}
                    <div
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(24px)',
                            transition: transitionBase,
                        }}
                    >
                      

                        <h1
                            className="leading-[1.1] tracking-tight mb-6"
                            style={{
                                fontFamily: "'Fredoka One', cursive",
                                fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
                                color: '#E8856A',
                            }}
                        >
                            Happy Tails<br />
                            <span style={{ color: '#C4907A' }}>Pet Booklet</span>
                        </h1>

                        <p
                            className="text-base sm:text-lg leading-relaxed mb-9 max-w-md font-semibold"
                            style={{ color: '#A87060' }}
                        >
                            Track feeding schedules, vet appointments, medicines, and grooming — all in one digital pet booklet for your dogs and cats. Add multiple pets, get reminders, and find nearby clinics.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-10">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2.5 font-bold px-7 py-3.5 rounded-full shadow-xl hover:-translate-y-0.5 transition-all text-sm text-white"
                                style={{ background: 'linear-gradient(135deg, #F4A8B8 0%, #E8856A 100%)' }}
                            >
                                🐶 Add Your First Pet
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 border text-sm font-bold px-6 py-3.5 rounded-full hover:bg-white transition-all"
                                style={{ borderColor: '#F4A8B8', color: '#E8856A', background: 'rgba(255,255,255,0.6)' }}
                            >
                                See How It Works
                            </a>
                        </div>

                        {/* Trust row */}
                        <div className="flex flex-wrap gap-5">
                            {[
                                { Icon: Bell,           label: 'Smart Reminders'  },
                                { Icon: MapPin,         label: 'Nearby Clinics'   },
                                { Icon: Syringe,        label: 'Vaccine Tracker'  },
                                { Icon: UtensilsCrossed,label: 'Feeding Schedules' },
                            ].map(({ Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#C4907A' }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color: '#E8856A' }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: App Mockup ── */}
                    <div
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transform: isLoaded ? 'translateY(0)' : 'translateY(32px)',
                            transition: 'opacity 0.7s ease 0.18s, transform 0.7s ease 0.18s',
                        }}
                    >
                        {/* Phone shell */}
                        <div
                            className="relative mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl max-w-[300px]"
                            style={{ background: '#fff', border: '3px solid #FDDBC8' }}
                        >
                            {/* Status bar */}
                            <div
                                className="flex items-center justify-between px-5 py-2.5"
                                style={{ background: 'linear-gradient(135deg, #F4A8B8 0%, #E8856A 100%)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                                        style={{ background: 'rgba(255,255,255,0.25)' }}>🐾</div>
                                    <p className="text-white text-[11px] font-black" style={{ fontFamily: "'Fredoka One', cursive" }}>
                                        Happy Tails
                                    </p>
                                </div>
                                <Bell className="w-4 h-4 text-white" />
                            </div>

                            {/* Content */}
                            <div className="p-4" style={{ background: '#FFF8F2' }}>

                                {/* Nearby clinics */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <MapPin className="w-3.5 h-3.5" style={{ color: '#E8856A' }} />
                                        <p className="text-[11px] font-black" style={{ color: '#E8856A' }}>
                                            Pet Clinics Near You
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        {clinics.map((c) => (
                                            <div
                                                key={c.name}
                                                className="flex items-center justify-between px-3 py-2 rounded-2xl"
                                                style={{ background: '#fff', border: '1px solid #FDDBC8' }}
                                            >
                                                <div>
                                                    <p className="text-[9px] font-black" style={{ color: '#5C3322' }}>{c.name}</p>
                                                    <p className="text-[8px] font-semibold" style={{ color: '#C4907A' }}>{c.dist} away</p>
                                                </div>
                                                <span
                                                    className="text-[8px] font-black px-2 py-0.5 rounded-full"
                                                    style={c.open
                                                        ? { background: '#DCFCE7', color: '#16A34A' }
                                                        : { background: '#FEE2E2', color: '#DC2626' }
                                                    }
                                                >
                                                    {c.open ? 'Open' : 'Closed'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reminders */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <Bell className="w-3.5 h-3.5" style={{ color: '#E8856A' }} />
                                        <p className="text-[11px] font-black" style={{ color: '#E8856A' }}>
                                            Pet Reminders
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        {reminders.map((r) => (
                                            <div
                                                key={r.label}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl"
                                                style={{ background: r.bg, border: `1px solid ${r.color}33` }}
                                            >
                                                <span className="text-sm">{r.emoji}</span>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black truncate" style={{ color: '#5C3322' }}>{r.label}</p>
                                                    <p className="text-[8px] font-semibold" style={{ color: r.color }}>{r.due}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* My Pets strip */}
                                <div>
                                    <p className="text-[11px] font-black mb-2" style={{ color: '#E8856A' }}>My Pets</p>
                                    <div className="flex gap-2">
                                        {[
                                            { emoji: '🐕', name: 'Max',   breed: 'Labrador' },
                                            { emoji: '🐩', name: 'Fluffy', breed: 'Poodle'   },
                                            { emoji: '🐈', name: 'Luna',  breed: 'Persian'  },
                                            { emoji: '➕', name: 'Add',   breed: 'New Pet'  },
                                        ].map((p) => (
                                            <div key={p.name} className="flex-1 text-center">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto mb-1"
                                                    style={{ background: '#FDDBC8', border: '2px solid #F4A8B8' }}
                                                >
                                                    {p.emoji}
                                                </div>
                                                <p className="text-[8px] font-black" style={{ color: '#5C3322' }}>{p.name}</p>
                                                <p className="text-[7px]" style={{ color: '#C4907A' }}>{p.breed}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom nav */}
                            <div
                                className="flex items-center justify-around px-4 py-3"
                                style={{ background: '#fff', borderTop: '1.5px solid #FDDBC8' }}
                            >
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-lg">🏠</span>
                                    <span className="text-[8px] font-bold" style={{ color: '#E8856A' }}>Home</span>
                                </div>
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl -mt-5 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #F4A8B8 0%, #E8856A 100%)', border: '3px solid #fff' }}
                                >
                                    🐾
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-lg">👤</span>
                                    <span className="text-[8px] font-bold" style={{ color: '#C4907A' }}>Profile</span>
                                </div>
                            </div>
                        </div>

                       
                    </div>

                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none" className="w-full block">
                    <path d="M0 40C360 80 1080 0 1440 40V80H0V40Z" fill="#FFF8F2" />
                </svg>
            </div>
        </section>
    );
}
