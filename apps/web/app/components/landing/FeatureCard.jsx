import { Target, CheckCircle2, Users, BarChart3, Shield, Clock } from 'lucide-react';

const iconMap = {
    indigo: Target,
    emerald: CheckCircle2,
    blue: Users,
    purple: BarChart3,
    orange: Shield,
    green: Clock,
};

const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
};

export default function FeatureCard({ title, description, color = 'indigo' }) {
    const Icon = iconMap[color];
    const classes = colorClasses[color];

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <div className={`w-12 h-12 ${classes} rounded-xl flex items-center justify-center mb-6`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
                {description}
            </p>
        </div>
    );
}
