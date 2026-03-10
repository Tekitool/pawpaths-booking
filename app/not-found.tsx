import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface-ivory flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-7xl font-bold text-accent mb-4">404</h1>
                <h2 className="text-2xl font-bold text-brand-text-01 mb-2">Page not found</h2>
                <p className="text-brand-text-02 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
