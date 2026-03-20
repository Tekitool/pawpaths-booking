// components/ui/Pagination.tsx
// Reusable server-side pagination component with URL-based state.

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
}: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    function buildHref(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        return `${pathname}?${params.toString()}`;
    }

    // Generate page numbers with ellipsis
    const pages: (number | '...')[] = [];
    const delta = 1; // pages around current
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - delta && i <= currentPage + delta)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="flex items-center justify-between gap-4 pt-4">
            {/* Info */}
            <div className="text-xs text-gray-500">
                {totalItems != null && pageSize != null ? (
                    <>
                        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}–
                        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                    </>
                ) : (
                    <>Page {currentPage} of {totalPages}</>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                {currentPage > 1 ? (
                    <Link
                        href={buildHref(currentPage - 1)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} />
                    </Link>
                ) : (
                    <span className="p-2 rounded-lg text-gray-300 cursor-not-allowed">
                        <ChevronLeft size={16} />
                    </span>
                )}

                {/* Page numbers */}
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
                            ...
                        </span>
                    ) : (
                        <Link
                            key={p}
                            href={buildHref(p)}
                            className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                p === currentPage
                                    ? 'bg-accent text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {p}
                        </Link>
                    ),
                )}

                {/* Next */}
                {currentPage < totalPages ? (
                    <Link
                        href={buildHref(currentPage + 1)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} />
                    </Link>
                ) : (
                    <span className="p-2 rounded-lg text-gray-300 cursor-not-allowed">
                        <ChevronRight size={16} />
                    </span>
                )}
            </div>
        </div>
    );
}
