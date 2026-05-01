import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/content/HeroSection';
import FeaturesSection from '../components/content/FeaturesSection';
import ServicesSection from '../components/content/ServicesSection';
import CTASection from '../components/content/CTASection';

export default function Home() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 80);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(t);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <Head title="Happy Tails — Your Pet's Digital Booklet">
                <link
                    href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen"
                style={{ background: '#FFF8F2', fontFamily: "'Nunito', sans-serif" }}
            >
                <Header scrollY={scrollY} />
                <main>
                    <HeroSection isLoaded={isLoaded} />
                    <FeaturesSection />
                    <ServicesSection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </>
    );
}
