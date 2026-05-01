import { Link } from '@inertiajs/react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{ background: 'linear-gradient(160deg, #F4A8B8 0%, #E8856A 60%, #D4734F 100%)', fontFamily: "'Nunito', sans-serif" }}>
            {/* Top wave */}
            <div style={{ background: '#FFF8F2' }}>
                <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none" className="w-full block">
                    <path d="M0 24C360 48 1080 0 1440 24V48H0V24Z" fill="#F4A8B8" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: 'rgba(255,255,255,0.20)', border: '1.5px solid rgba(255,255,255,0.30)' }}
                            >
                                🐾
                            </div>
                            <div>
                                <p
                                    className="text-white text-[15px] uppercase leading-tight"
                                    style={{ fontFamily: "'Fredoka One', cursive" }}
                                >
                                    Happy Tails
                                </p>
                                <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                    Your Pet's Digital Booklet
                                </p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed font-semibold mb-5" style={{ color: 'rgba(255,255,255,0.80)' }}>
                            A free, fully digital pet health booklet for dog and cat owners. Track vaccines, meds, grooming, feeding, and more — all in one place.
                        </p>
                        {/* Social icons */}
                        <div className="flex gap-2">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-0.5"
                                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                                >
                                    <Icon className="w-4 h-4 text-white opacity-80" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-[11px] font-black text-white mb-5 uppercase tracking-[0.20em]">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: '🏠 Home',         href: '#home'     },
                                { label: '⚙️ How It Works', href: '#features'  },
                                { label: '🐾 Pet Tracking', href: '#services'  },
                                { label: '📍 Contact',      href: '#contact'   },
                                { label: '🔑 Login',        href: '/login'     },
                            ].map(item => (
                                <li key={item.label}>
                                    {item.href.startsWith('#') ? (
                                        <a
                                            href={item.href}
                                            className="text-sm font-semibold transition-colors hover:text-white"
                                            style={{ color: 'rgba(255,255,255,0.75)' }}
                                        >
                                            {item.label}
                                        </a>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="text-sm font-semibold transition-colors hover:text-white"
                                            style={{ color: 'rgba(255,255,255,0.75)' }}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pet Features */}
                    <div>
                        <h4 className="text-[11px] font-black text-white mb-5 uppercase tracking-[0.20em]">
                            Pet Features
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                '💉 Vaccination Records',
                                '💊 Medicine Schedules',
                                '✂️ Grooming History',
                                '🍽️ Feeding Schedules',
                                '🏥 Vet Appointments',
                                '📊 Health Overview',
                            ].map(label => (
                                <li key={label} className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-[11px] font-black text-white mb-5 uppercase tracking-[0.20em]">
                            Contact Us
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-white opacity-70" />
                                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    123 Paw Street, Pet City, Philippines
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 flex-shrink-0 text-white opacity-70" />
                                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    +63 2 8123 4567
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 flex-shrink-0 text-white opacity-70" />
                                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    hello@happytailsapp.ph
                                </span>
                            </li>
                        </ul>

                        {/* Supported pets */}
                        <div
                            className="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                        >
                            <span className="text-2xl">🐕🐈</span>
                            <div>
                                <p className="text-white text-xs font-black">Dogs & Cats</p>
                                <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.70)' }}>
                                    Multi-pet support
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}
                >
                    <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.70)' }}>
                        © {currentYear} Happy Tails Pet Care App. All rights reserved. 
                    </p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service'].map(label => (
                            <a
                                key={label}
                                href="#"
                                className="text-sm font-semibold transition-colors hover:text-white"
                                style={{ color: 'rgba(255,255,255,0.70)' }}
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
