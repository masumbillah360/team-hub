import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-20 bg-linear-to-r from-indigo-600 to-purple-600">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to transform your team's productivity?
                </h2>
                <p className="text-xl text-indigo-100 mb-8">
                    Join thousands of teams already using TeamHub to achieve
                    their goals and collaborate effectively.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </section>
    );
}
