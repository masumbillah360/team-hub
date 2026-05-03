'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api/auth';
import AuthHeader from '../components/AuthHeader';
import PasswordInput from '../components/PasswordInput';
import LoadingButton from '../components/LoadingButton';
import ErrorMessage from '../components/ErrorMessage';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get token from URL params or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token') || localStorage.getItem('resetToken');

            if (!token) {
                setError('Reset token not found. Please restart the password reset process.');
                setLoading(false);
                return;
            }

            await authAPI.resetPassword({ token, password });
            // Clear the token after use
            localStorage.removeItem('resetToken');
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <AuthHeader tagline="Set new password" />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 p-8">
                    {submitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600 dark:text-green-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Password updated
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Your password has been successfully reset.
                            </p>
                            <Link
                                href="/login"
                                className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Create new password
                            </h2>

                            <ErrorMessage message={error} />

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <PasswordInput
                                    label="New Password"
                                    name="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                />
                                <PasswordInput
                                    label="Confirm New Password"
                                    name="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                />

                                <LoadingButton loading={loading}>
                                    Reset password
                                </LoadingButton>
                            </form>
                            <div className="mt-8 flex justify-center items-center">
                                <Link
                                    href="/login"
                                    className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Sign in
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
