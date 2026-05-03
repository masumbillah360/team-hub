'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../lib/store/authStore';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, setUser, setError } = useAuthStore();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:3005/api/v1/auth/profile', {
                    credentials: 'include', // Send cookies
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else if (response.status === 401) {
                    // Token expired or invalid, redirect to login
                    router.push('/login');
                } else {
                    setError('Failed to load profile');
                }
            } catch (error) {
                console.error('Profile fetch error:', error);
                setError('Failed to load profile');
                router.push('/login');
            }
        };

        // Only fetch if we don't have user data yet
        if (!user && isAuthenticated) {
            fetchProfile();
        }
    }, [user, isAuthenticated, setUser, setError, router]);

    if (!isAuthenticated) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
        );
    }

    return (
        <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
                You are now logged in to your dashboard.
            </p>
        </div>
    );
}
