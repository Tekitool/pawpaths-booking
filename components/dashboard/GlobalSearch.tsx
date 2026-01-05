'use client';

import { useState } from 'react';
import { useSmartSearch } from '@/hooks/useSmartSearch'; // Import your new hook
import { Search, Loader2, User, Box, Cat } from 'lucide-react';
import Link from 'next/link';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const { results, isSearching } = useSmartSearch(query);

    // Helper for icons based on type
    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Box className="w-4 h-4 text-orange-500" />;
            case 'customer': return <User className="w-4 h-4 text-blue-500" />;
            case 'pet': return <Cat className="w-4 h-4 text-purple-500" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    return (
        <div className="relative w-full max-w-md group">
            {/* Input Field */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search (PP-, Name, Email)..."
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
                )}
            </div>

            {/* Results Dropdown */}
            {query && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="py-2">
                        {results.map((result) => (
                            <Link
                                key={`${result.type}-${result.id}`}
                                href={result.url}
                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors gap-3"
                                onClick={() => setQuery('')} // Clear on click
                            >
                                <div className="p-2 bg-gray-100 rounded-full">
                                    {getIcon(result.type)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{result.title}</p>
                                    <p className="text-xs text-gray-500 capitalize">{result.subtitle}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {query && !isSearching && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-center z-50">
                    <p className="text-sm text-gray-500">No results found.</p>
                </div>
            )}
        </div>
    );
}
