'use client';

import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function AuthProvider({ children }) {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        // Check authentication status on app load
        checkAuth();
    }, [checkAuth]);

    return children;
}
