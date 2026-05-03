'use client';

import { Mail, User } from 'lucide-react';

const iconMap = {
    mail: Mail,
    user: User,
};

const FormInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    icon,
    required = false,
}) => {
    const Icon = iconMap[icon];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

export default FormInput;
