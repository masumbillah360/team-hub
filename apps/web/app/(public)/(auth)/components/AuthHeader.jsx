'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

const AuthHeader = ({ tagline = 'Team collaboration platform' }) => {
    return (
        <Link href="/">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    TeamHub
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {tagline}
                </p>
            </div>
        </Link>
    );
};

export default AuthHeader;
