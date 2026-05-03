'use client';

const LoadingButton = ({ loading, children, onClick, type = 'submit', className = '' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading}
            className={`w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default LoadingButton;
