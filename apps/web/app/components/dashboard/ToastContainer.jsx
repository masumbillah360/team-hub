'use client';

import useStore from '@/lib/store';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useStore();

    if (toasts.length === 0) return null;

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const backgrounds = {
        success:
            'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        warning:
            'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };

    return (
        <div className="fixed bottom-6 right-6 z-300 flex flex-col gap-2">
            {toasts.map((toast, i) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slideUp ${backgrounds[toast.type]}`}
                    style={{ animationDelay: `${i * 50}ms` }}>
                    {icons[toast.type]}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {toast.message}
                    </span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
