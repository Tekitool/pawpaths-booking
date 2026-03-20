// hooks/useMediaQuery.ts
// Lightweight responsive breakpoint hook using window.matchMedia.

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(query);
        setMatches(mql.matches);

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
