import '@repo/ui/styles.css';
import './globals.css';

import { Geist } from 'next/font/google';
import LandingNav from './components/landing/Navbar';
import AuthProvider from '../lib/components/AuthProvider';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
    title: 'TeamHub - Modern Team Collaboration Platform',
    description: 'Collaborate, track, and achieve with TeamHub - the modern team collaboration platform for goals, announcements, and action items.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={geist.className}>
                <AuthProvider>
                    <LandingNav />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
