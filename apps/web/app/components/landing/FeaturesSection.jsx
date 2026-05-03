import FeatureCard from './FeatureCard';

const features = [
    {
        title: 'Goal Management',
        description: 'Set, track, and achieve team goals with milestones, progress tracking, and collaborative updates.',
        color: 'indigo',
    },
    {
        title: 'Action Items',
        description: 'Create, assign, and track action items with due dates, priorities, and status updates.',
        color: 'emerald',
    },
    {
        title: 'Team Communication',
        description: 'Share announcements, discuss goals, and keep everyone aligned with integrated communication tools.',
        color: 'blue',
    },
    {
        title: 'Analytics & Insights',
        description: 'Get detailed insights into team performance, goal progress, and productivity metrics.',
        color: 'purple',
    },
    {
        title: 'Audit Trail',
        description: 'Complete audit logs of all activities, changes, and team actions for transparency and compliance.',
        color: 'orange',
    },
    {
        title: 'Real-time Updates',
        description: 'Stay updated with real-time notifications, live progress tracking, and instant team communication.',
        color: 'green',
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything you need to succeed
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Powerful features designed to help teams collaborate
                        effectively, track progress, and achieve their
                        goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}
