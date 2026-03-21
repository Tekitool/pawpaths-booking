// hooks/useMediaQuery.ts
// Lightweight responsive breakpoint hook using window.matchMedia.

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    // Lazy initializer avoids calling setState synchronously in useEffect (react-hooks/set-state-in-effect).
    // On the server, window is undefined so we default to false.
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

/** True when viewport is below md breakpoint (768px) */
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 767px)');
}
