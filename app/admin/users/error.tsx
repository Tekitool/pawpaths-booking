'use client';

import { useEffect } from 'react';
import { Users } from 'lucide-react';

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Users error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
          <Users className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-brand-text-01 mb-2">
          Could not load users
        </h2>
        <p className="text-brand-text-02 mb-8">
          There was a problem fetching user data. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
