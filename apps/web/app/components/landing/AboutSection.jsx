import { Target, Users, Zap } from 'lucide-react';

const aboutPoints = [
    {
        icon: Target,
        title: 'Goal-Oriented',
        description: 'Every feature is designed to help teams set and achieve their goals.',
        color: 'indigo',
    },
    {
        icon: Users,
        title: 'Team-Centric',
        description: 'Built for collaboration, with features that bring teams together.',
        color: 'emerald',
    },
    {
        icon: Zap,
        title: 'Fast & Intuitive',
        description: 'A modern interface that\'s easy to learn and quick to use.',
        color: 'purple',
    },
];

export default function AboutSection() {
    return (
        <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        About TeamHub
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Empowering teams to achieve more together through
                        seamless collaboration and goal tracking.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            Our Mission
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            TeamHub was built with a simple mission: to help
                            teams collaborate more effectively and achieve
                            their goals faster. We believe that when teams
                            have the right tools, they can accomplish
                            extraordinary things.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            Our platform combines goal management, action
                            item tracking, and team communication into one
                            seamless experience, making it easier for teams
                            to stay aligned and productive.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
                        <div className="space-y-6">
                            {aboutPoints.map((point, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className={`w-10 h-10 bg-${point.color}-100 dark:bg-${point.color}-900 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <point.icon className={`w-5 h-5 text-${point.color}-600 dark:text-${point.color}-400`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {point.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {point.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
