import { Link } from '@inertiajs/react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function CTASection() {
    return (
        <section id="contact" className="py-24" style={{ background: '#FFF8F2' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

                    {/* ── LEFT: Contact info ── */}
                    <div>
                        <span
                            className="inline-block text-[10px] font-black uppercase tracking-[0.22em] px-4 py-1.5 rounded-full mb-5"
                            style={{ background: '#FDDBC8', color: '#E8856A' }}
                        >
                            Contact & Support
                        </span>
                        <h2
                            className="text-3xl sm:text-4xl mb-4 tracking-tight"
                            style={{ fontFamily: "'Fredoka One', cursive", color: '#E8856A', fontWeight: 400 }}
                        >
                            We're Here for You & Your Pets 🐾
                        </h2>
                        <p className="text-base leading-relaxed mb-9 max-w-md font-semibold" style={{ color: '#A87060' }}>
                            Have a question, feedback, or need help setting up your pet's profile? Reach out anytime — we love hearing from pet parents!
                        </p>

                        {/* Contact cards */}
                        <div className="space-y-4 mb-8">
                            {[
                                { Icon: MapPin, label: 'Address', value: '123 Paw Street, Pet City, Philippines' },
                                { Icon: Phone,  label: 'Phone',   value: '+63 2 8123 4567'                       },
                                { Icon: Mail,   label: 'Email',   value: 'hello@happytailsapp.ph'               },
                            ].map(({ Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-4">
                                    <div
                                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: '#FDDBC8' }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: '#E8856A' }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#C4907A' }}>
                                            {label}
                                        </p>
                                        <p className="text-sm font-bold" style={{ color: '#5C3322' }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Support hours */}
                        <div
                            className="flex items-start gap-4 p-4 rounded-2xl"
                            style={{ background: '#FFF0E8', borderLeft: '3px solid #E8856A' }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: '#FDDBC8' }}>
                                <Clock className="w-4 h-4" style={{ color: '#E8856A' }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#C4907A' }}>
                                    Support Hours
                                </p>
                                <p className="text-sm font-bold" style={{ color: '#5C3322' }}>Monday – Saturday</p>
                                <p className="text-sm font-semibold" style={{ color: '#A87060' }}>8:00 AM – 8:00 PM</p>
                                <p className="text-sm font-bold mt-1" style={{ color: '#5C3322' }}>Sunday</p>
                                <p className="text-sm font-semibold" style={{ color: '#A87060' }}>10:00 AM – 4:00 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: CTA card ── */}
                    <div
                        className="rounded-3xl overflow-hidden shadow-2xl"
                        style={{ background: 'linear-gradient(145deg, #F4A8B8 0%, #E8856A 100%)' }}
                    >
                        <div className="p-10 text-center">
                            {/* Icon */}
                            <div
                                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-5xl"
                                style={{ background: 'rgba(255,255,255,0.20)' }}
                            >
                                🐾
                            </div>

                            <h3
                                className="text-2xl sm:text-3xl text-white mb-3"
                                style={{ fontFamily: "'Fredoka One', cursive", fontWeight: 400 }}
                            >
                                Ready to Start?
                            </h3>
                            <p className="text-sm leading-relaxed mb-8 max-w-xs mx-auto font-semibold"
                                style={{ color: 'rgba(255,255,255,0.85)' }}
                            >
                                Create a free account, add your dogs and cats, and start building their digital health booklet today.
                            </p>

                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2.5 font-black px-8 py-3.5 rounded-full shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                                style={{ background: '#fff', color: '#E8856A' }}
                            >
                                🐶 Create Free Account
                                <span className="opacity-60">›</span>
                            </Link>

                            <p className="mt-4 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                No credit card required. Free forever for basic use.
                            </p>
                        </div>

                      
                    </div>

                </div>
            </div>
        </section>
    );
}
