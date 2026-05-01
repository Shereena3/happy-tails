import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, LogIn, CalendarHeart } from 'lucide-react';

interface HeaderProps {
    scrollY: number;
}

export default function Header({ scrollY }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isScrolled = scrollY > 50;

    const navItems = [
        { name: 'Home',         href: '#home'     },
        { name: 'How It Works', href: '#features'  },
        { name: 'Pet Tracking', href: '#services'  },
        { name: 'Contact',      href: '#contact'   },
    ];

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={
                isScrolled
                    ? { background: '#fff', boxShadow: '0 4px 24px rgba(232,133,106,0.12)', padding: '8px 0' }
                    : { background: 'rgba(255,248,242,0.80)', backdropFilter: 'blur(14px)', borderBottom: '1.5px solid rgba(244,168,184,0.30)', padding: '12px 0' }
            }
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: '#FDDBC8', border: '2px solid #F4A8B8' }}
                        >
                            🐾
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <p
                                className="text-[15px] uppercase tracking-wider"
                                style={{ fontFamily: "'Fredoka One', cursive", color: '#E8856A' }}
                            >
                                Happy Tails
                            </p>
                            <p className="text-[10px] font-semibold" style={{ color: '#C4907A' }}>
                                Your Pet's Digital Booklet
                            </p>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-7">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-sm font-bold transition-colors"
                                style={{ color: '#A87060' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#E8856A')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#A87060')}
                            >
                                {item.name}
                            </a>
                        ))}
                    </nav>

                    {/* CTA buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all"
                            style={{ color: '#E8856A' }}
                        >
                            <LogIn className="w-4 h-4" /> Login
                        </Link>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all text-white"
                            style={{ background: 'linear-gradient(135deg, #F4A8B8 0%, #E8856A 100%)' }}
                        >
                            <CalendarHeart className="w-4 h-4" />
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-full"
                        style={{ background: '#FDDBC8', color: '#E8856A' }}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <>
                    <div className="fixed inset-0 bg-black/25 z-40" onClick={() => setMobileMenuOpen(false)} />
                    <div
                        className="fixed top-[72px] right-4 left-4 rounded-3xl shadow-2xl z-50 p-5 space-y-1"
                        style={{ background: '#fff', border: '1.5px solid #FDDBC8' }}
                    >
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-colors"
                                style={{ color: '#A87060' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#FFF0E8')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </a>
                        ))}
                        <div className="pt-3 border-t space-y-2" style={{ borderColor: '#FDDBC8' }}>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-bold border"
                                style={{ color: '#E8856A', borderColor: '#F4A8B8' }}
                            >
                                <LogIn className="w-4 h-4" /> Login
                            </Link>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-bold text-white shadow-md"
                                style={{ background: 'linear-gradient(135deg, #F4A8B8 0%, #E8856A 100%)' }}
                            >
                                <CalendarHeart className="w-4 h-4" /> Get Started Free
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
