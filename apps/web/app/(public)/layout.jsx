import LandingNav from "../components/landing/Navbar";

export default function PublicLayout({ children }) {
    return (
        <>
            <LandingNav />
            {children}
        </>
    );
}
