import HeroSection from './components/landing/HeroSection';
import FeaturesSection from './components/landing/FeaturesSection';
import AboutSection from './components/landing/AboutSection';
import CTASection from './components/landing/CTASection';
import Footer from './components/landing/Footer';

export default function Home() {
    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
            <HeroSection />
            <FeaturesSection />
            <AboutSection />
            <CTASection />
            <Footer />
        </div>
    );
}
