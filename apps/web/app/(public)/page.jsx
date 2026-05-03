import AboutSection from '../components/landing/AboutSection';
import CTASection from '../components/landing/CTASection';
import FeaturesSection from '../components/landing/FeaturesSection';
import Footer from '../components/landing/Footer';
import HeroSection from '../components/landing/HeroSection';

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
