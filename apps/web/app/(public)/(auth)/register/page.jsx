'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import useAuthStore from '../../lib/store/authStore';
import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import LoadingButton from '../components/LoadingButton';
import ErrorMessage from '../components/ErrorMessage';
import useAuthStore from '@/lib/store/authStore';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, error, loading, clearError } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        if (password !== confirmPassword) {
            useAuthStore.setState({ error: 'Passwords do not match' });
            return;
        }

        if (password.length < 6) {
            useAuthStore.setState({ error: 'Password must be at least 6 characters' });
            return;
        }

        try {
            await register({ name, email, password });
            // Navigate to root, middleware will redirect to dashboard if authenticated
            router.push('/');
        } catch (err) {
            // Error is already set in the store
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <AuthHeader tagline="Create your account" />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Get started
                    </h2>

                    <ErrorMessage message={error} />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            label="Full Name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            icon="user"
                            required
                        />

                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            icon="mail"
                            required
                        />

                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <LoadingButton loading={loading}>
                            Create Account
                        </LoadingButton>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
