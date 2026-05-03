'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api/auth';
import useAuthStore from '../../../lib/store/authStore';
import AuthHeader from '../components/AuthHeader';
import FormInput from '../components/FormInput';
import LoadingButton from '../components/LoadingButton';
import ErrorMessage from '../components/ErrorMessage';

export default function ForgetPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authAPI.forgotPassword(email);
            setSubmitted(true);
            // Pass email to verify-otp page via router state or localStorage
            localStorage.setItem('resetEmail', email);
            router.push('/verify-otp');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <AuthHeader tagline="Reset your password" />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 p-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Forgot password?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Enter your email address and we'll send you a link
                            to reset your password.
                        </p>

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

                            <LoadingButton loading={loading}>
                                Send OTP
                            </LoadingButton>
                        </form>

                        <div className="mt-4 text-center">
                            <Link
                                href="/login"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
