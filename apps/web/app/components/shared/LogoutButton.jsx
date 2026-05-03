'use client';

import { useRouter } from 'next/navigation';
import useAuthStore from '../../../lib/store/authStore';

export default function LogoutButton() {
    const router = useRouter();
    const { logout, user } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <button
            onClick={handleLogout}
            className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
        >
            Logout
            {user.name && <span className="ml-1">({user.name})</span>}
        </button>
    );
}
