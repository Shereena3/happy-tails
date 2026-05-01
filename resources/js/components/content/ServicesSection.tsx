const trackingFeatures = [
    {
        emoji: '💉',
        title: 'Vaccination Records',
        description: 'Log every vaccine your pet receives — rabies, distemper, parvovirus, and more. Set due dates for boosters and get notified before they expire.',
        badge: 'Dogs & Cats',
        popular: true,
    },
    {
        emoji: '💊',
        title: 'Medicine Schedule',
        description: 'Track prescriptions, deworming tablets, flea treatments, and supplements. Set dosage times and get daily reminders so you never miss a dose.',
        badge: 'Dogs & Cats',
        popular: true,
    },
    {
        emoji: '✂️',
        title: 'Grooming History',
        description: 'Record every bath, haircut, nail trim, and ear cleaning session. Schedule grooming appointments and keep a complete log of your pet\'s care.',
        badge: 'Dogs & Cats',
        popular: false,
    },
    {
        emoji: '🍽️',
        title: 'Feeding Schedules',
        description: 'Set meal times, portion sizes, and food types for each pet. Get reminders at feeding time so your pet eats on a healthy, consistent schedule.',
        badge: 'Dogs & Cats',
        popular: false,
    },
    {
        emoji: '🏥',
        title: 'Vet Appointments',
        description: 'Schedule and track vet visits for check-ups, follow-ups, or emergencies. View nearby clinic info and log visit notes and diagnosis details.',
        badge: 'Multi-pet',
        popular: false,
    },
    {
        emoji: '📊',
        title: 'Health Overview',
        description: 'Your pet\'s full history in one place — weight tracking, medical notes, and an at-a-glance summary card for every dog or cat in your account.',
        badge: 'Multi-pet',
        popular: false,
    },
];

export default function ServicesSection() {
    return (
        <section id="services" className="py-24" style={{ background: '#FFF0E8' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <span
                        className="inline-block text-[10px] font-black uppercase tracking-[0.22em] px-4 py-1.5 rounded-full mb-4"
                        style={{ background: '#FDDBC8', color: '#E8856A' }}
                    >
                        Pet Tracking Features
                    </span>
                    <h2
                        className="text-3xl sm:text-4xl mb-4 tracking-tight"
                        style={{ fontFamily: "'Fredoka One', cursive", color: '#E8856A', fontWeight: 400 }}
                    >
                        Everything in One Booklet
                    </h2>
                    <p className="text-lg max-w-md mx-auto font-semibold" style={{ color: '#A87060' }}>
                        Track all your pet's health needs — logged, organized, and reminded automatically.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {trackingFeatures.map(({ emoji, title, description, badge, popular }) => (
                        <div
                            key={title}
                            className="group relative bg-white rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            style={{ borderColor: '#FDDBC8' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#F4A8B8')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = '#FDDBC8')}
                        >
                            {/* Popular badge */}
                            {popular && (
                                <span
                                    className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                                    style={{ background: 'linear-gradient(135deg, #F4A8B8, #E8856A)' }}
                                >
                                    Popular
                                </span>
                            )}

                            {/* Emoji */}
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                                style={{ background: '#FFF0E8' }}
                            >
                                {emoji}
                            </div>

                            <h3
                                className="text-sm font-black mb-2 leading-snug"
                                style={{ color: '#5C3322', paddingRight: popular ? '3rem' : '0' }}
                            >
                                {title}
                            </h3>
                            <p className="text-sm leading-relaxed mb-5 font-semibold" style={{ color: '#A87060' }}>
                                {description}
                            </p>

                            <div className="flex items-center justify-between">
                                <span
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                    style={{ background: '#FDDBC8', color: '#E8856A' }}
                                >
                                    🐾 {badge}
                                </span>
                                <span className="text-[10px] font-semibold" style={{ color: '#C4907A' }}>
                                    Free feature
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <div className="mt-10 text-center">
                    <p className="text-sm max-w-lg mx-auto font-semibold" style={{ color: '#C4907A' }}>
                        All features are available for both dogs and cats. You can add as many pets as you need — one booklet per pet, all in one account.
                    </p>
                </div>
            </div>
        </section>
    );
}
