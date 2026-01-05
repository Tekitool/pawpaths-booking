'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function GroupedSelect({
    placeholder = "Select...",
    value,
    onChange,
    groups = [], // [{ label: 'Group', options: [{ value, color }] }]
    searchable = false,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const flatOptions = groups.flatMap((g) => g.options);
    const selectedOption = flatOptions.find((o) => o.value === value);

    const filteredGroups = groups.map(group => ({
        ...group,
        options: group.options.filter(opt =>
            opt.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(group => group.options.length > 0);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-brand-text-02/20 focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
                <span className={`block truncate ${!selectedOption ? 'text-brand-text-02/60' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.value : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-5 w-5 text-brand-text-02/60" />
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {searchable && (
                        <div className="sticky top-0 z-10 bg-white px-2 py-2 border-b border-brand-text-02/20">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-02/60" />
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-brand-text-02/20 py-1 pl-8 pr-2 text-sm focus:border-accent focus:outline-none"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {filteredGroups.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-brand-text-02/80">No options found</div>
                    ) : (
                        filteredGroups.map((group) => (
                            <div key={group.label}>
                                <div className="px-3 py-1.5 text-xs font-bold text-brand-text-02/80 bg-brand-text-02/5/50 uppercase tracking-wider">
                                    {group.label}
                                </div>
                                {group.options.map((opt) => (
                                    <div
                                        key={opt.value}
                                        className={`
                                            relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-accent/15
                                            ${value === opt.value ? 'bg-accent/15 text-orange-900' : 'text-gray-900'}
                                        `}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <span className={`block truncate ${value === opt.value ? 'font-medium' : 'font-normal'}`}>
                                            {opt.value}
                                        </span>
                                        {value === opt.value && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
