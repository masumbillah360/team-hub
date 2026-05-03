import { Zap } from 'lucide-react';

export default function Footer() {
    const fullYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Zap className="w-8 h-8 text-indigo-400 mr-3" />
                        <span className="text-2xl font-bold">TeamHub</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        © {fullYear} TeamHub. Built for modern teams.
                    </div>
                </div>
            </div>
        </footer>
    );
}
