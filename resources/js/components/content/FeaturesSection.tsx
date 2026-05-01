import { ArrowRight } from 'lucide-react';

const steps = [
    {
        emoji: '🔑',
        step: '01',
        title: 'Create Your Account',
        description: 'Sign up as a pet owner in seconds. Enter your name, email, and set your password — your personal pet booklet is ready to go.',
    },
    {
        emoji: '🐾',
        step: '02',
        title: 'Add Your Pets',
        description: 'Tap the paw icon on the bottom nav to add your pets. Support for dogs and cats — add a name, breed, birthday, and photo for each.',
    },
    {
        emoji: '🏥',
        step: '03',
        title: 'Discover Nearby Clinics',
        description: 'The home screen automatically shows pet clinics near your location. View hours, distance, and availability — no more searching online.',
    },
    {
        emoji: '📋',
        step: '04',
        title: 'Open a Pet Profile',
        description: 'Tap any pet\'s name to open their full profile. From there, choose what to log: Vaccination records, Medicine schedules, or Grooming history.',
    },
    {
        emoji: '🔔',
        step: '05',
        title: 'Get Smart Reminders',
        description: 'Never miss a feeding, medicine dose, or vet visit again. Happy Tails sends timely in-app notifications and reminders right on your home screen.',
    },
    {
        emoji: '👤',
        step: '06',
        title: 'Manage Your Profile',
        description: 'Access your owner profile to update your info, manage notification settings, view all your pets in one place, and review your full activity history.',
    },
];

const flowSteps = ['Sign Up', 'Add Pet', 'Find Clinic', 'Log Records', 'Get Reminders', 'Stay Updated'];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24" style={{ background: '#FFF8F2' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <span
                        className="inline-block text-[10px] font-black uppercase tracking-[0.22em] px-4 py-1.5 rounded-full mb-4"
                        style={{ background: '#FDDBC8', color: '#E8856A' }}
                    >
                        How It Works
                    </span>
                    <h2
                        className="text-3xl sm:text-4xl mb-4 tracking-tight"
                        style={{ fontFamily: "'Fredoka One', cursive", color: '#E8856A', fontWeight: 400 }}
                    >
                        Your Pet Booklet, Simplified
                    </h2>
                    <p className="text-lg max-w-md mx-auto font-semibold" style={{ color: '#A87060' }}>
                        Six simple steps to keep every tail wagging and every record up to date.
                    </p>
                </div>

                {/* Step cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
                    {steps.map(({ emoji, step, title, description }) => (
                        <div
                            key={step}
                            className="group relative p-6 rounded-3xl border bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            style={{ borderColor: '#FDDBC8' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#F4A8B8')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = '#FDDBC8')}
                        >
                            {/* Watermark number */}
                            <span
                                className="absolute -bottom-3 -right-1 text-[80px] font-black leading-none select-none pointer-events-none"
                                style={{ fontFamily: "'Fredoka One', cursive", color: '#E8856A', opacity: 0.05 }}
                            >
                                {step}
                            </span>

                            {/* Emoji icon */}
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl transition-transform group-hover:scale-110"
                                style={{ background: '#FFF0E8' }}
                            >
                                {emoji}
                            </div>

                            {/* Step pill */}
                            <span
                                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3 inline-block"
                                style={{ background: '#FDDBC8', color: '#E8856A' }}
                            >
                                Step {step}
                            </span>

                            <h3 className="text-sm font-black mb-2" style={{ color: '#5C3322' }}>{title}</h3>
                            <p className="text-sm leading-relaxed font-semibold" style={{ color: '#A87060' }}>{description}</p>
                        </div>
                    ))}
                </div>

                {/* Flow bar */}
                <div
                    className="rounded-3xl px-7 py-8"
                    style={{ background: 'linear-gradient(135deg, #F4A8B8 0%, #E8856A 100%)' }}
                >
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] mb-6 text-white opacity-70">
                        App Flow
                    </p>
                    <div className="flex items-center justify-center flex-wrap gap-1.5">
                        {flowSteps.map((label, i) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <div className="flex items-center gap-2 text-white text-xs font-bold px-3.5 py-2 rounded-2xl whitespace-nowrap"
                                    style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)' }}
                                >
                                    <span
                                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                                        style={{ background: 'rgba(255,255,255,0.25)' }}
                                    >
                                        {i + 1}
                                    </span>
                                    {label}
                                </div>
                                {i < flowSteps.length - 1 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-white opacity-60 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
