import LandingNav from '@/app/components/landing/Navbar';

export default function PublicLayout({ children }) {
    return (
        <>
            <LandingNav />
            {children}
        </>
    );
}
