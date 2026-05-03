'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '../../../lib/store/authStore';
import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import LoadingButton from '../components/LoadingButton';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading, clearError } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        try {
            await login({ email, password });
            // Navigate to root, middleware will redirect to dashboard if authenticated
            router.push('/');
        } catch (err) {
            // Error is already set in the store
            console.log('error ->', err?.message);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <AuthHeader tagline="Collaborate. Track. Achieve." />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Welcome back
                    </h2>

                    <ErrorMessage message={error} />

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <LoadingButton loading={loading}>Sign In</LoadingButton>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">
                            Forget your password?{' '}
                            <Link
                                href="/forget-password"
                                className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-4">
                                Forget Password
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
