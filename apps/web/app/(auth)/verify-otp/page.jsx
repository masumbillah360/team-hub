'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../lib/api/auth';
import AuthHeader from '../components/AuthHeader';
import LoadingButton from '../components/LoadingButton';
import ErrorMessage from '../components/ErrorMessage';

const OTP_LENGTH = 6;

function VerifyOTPPage() {
    const router = useRouter();
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const inputRefs = useRef([]);

    useEffect(() => {
        const storedEmail = localStorage.getItem('resetEmail');
        if (storedEmail) setEmail(storedEmail);
        // Auto-focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    // Central function: fill OTP array starting at a given index
    const fillFrom = useCallback((startIndex, digits) => {
        setOtp((prev) => {
            const next = [...prev];
            digits.forEach((d, i) => {
                if (startIndex + i < OTP_LENGTH) next[startIndex + i] = d;
            });
            return next;
        });
        // Focus the slot after the last filled digit (or the last slot)
        const focusIndex = Math.min(startIndex + digits.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    }, []);

    const handleChange = useCallback(
        (index, value) => {
            // Strip non-digits
            const digits = value.replace(/\D/g, '').split('');
            if (!digits.length) return;
            fillFrom(index, digits);
        },
        [fillFrom],
    );

    // Dedicated paste handler — always fills from index 0 for predictability,
    // or from current index if the user clearly intends a partial paste.
    const handlePaste = useCallback(
        (index, e) => {
            e.preventDefault();
            const pasted = e.clipboardData
                .getData('text')
                .replace(/\D/g, '')
                .split('');
            if (!pasted.length) return;
            // If pasting a full-length code, always start from 0
            const startAt = pasted.length === OTP_LENGTH ? 0 : index;
            fillFrom(startAt, pasted);
        },
        [fillFrom],
    );

    const handleKeyDown = useCallback(
        (index, e) => {
            if (e.key === 'Backspace') {
                if (otp[index]) {
                    // Clear current slot
                    setOtp((prev) => {
                        const next = [...prev];
                        next[index] = '';
                        return next;
                    });
                } else if (index > 0) {
                    // Move to previous and clear it
                    setOtp((prev) => {
                        const next = [...prev];
                        next[index - 1] = '';
                        return next;
                    });
                    inputRefs.current[index - 1]?.focus();
                }
                return;
            }
            if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                inputRefs.current[index - 1]?.focus();
                return;
            }
            if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
                e.preventDefault();
                inputRefs.current[index + 1]?.focus();
                return;
            }
        },
        [otp],
    );

    // Select-all on focus so typing overwrites the existing digit cleanly
    const handleFocus = useCallback((e) => {
        e.target.select();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length < OTP_LENGTH) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await authAPI.verifyOTP({ email, otp: otpValue });
            localStorage.setItem('resetToken', data.resetToken);
            // Also pass token in URL as fallback
            router.push(`/reset-password?token=${data.resetToken}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
            // Clear inputs and refocus first on error
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        try {
            await authAPI.forgotPassword(email);
            setError('');
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const isComplete = otp.every((d) => d !== '');

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <AuthHeader tagline="Verify your email" />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Enter verification code
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        We've sent a 6-digit code to {email || 'your email'}
                    </p>

                    <ErrorMessage message={error} />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div
                            className="flex justify-center gap-2"
                            role="group"
                            aria-label="One-time password">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) =>
                                        (inputRefs.current[index] = el)
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={
                                        index === 0 ? 'one-time-code' : 'off'
                                    }
                                    maxLength={OTP_LENGTH} // allow full paste into any slot
                                    value={digit}
                                    onChange={(e) =>
                                        handleChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={(e) => handlePaste(index, e)}
                                    onFocus={handleFocus}
                                    aria-label={`Digit ${index + 1}`}
                                    className={`w-12 h-14 text-center text-2xl font-bold border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition
                                                ${
                                                    digit
                                                        ? 'border-indigo-400 dark:border-indigo-500'
                                                        : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                />
                            ))}
                        </div>

                        <LoadingButton loading={loading} disabled={!isComplete}>
                            Verify
                        </LoadingButton>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Resend
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default VerifyOTPPage;
