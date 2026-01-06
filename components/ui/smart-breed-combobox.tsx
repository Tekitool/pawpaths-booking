'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface Breed {
    id: number
    name: string
    species: 'Dog' | 'Cat'
    is_snub_nosed: boolean
    is_high_risk: boolean
}

interface SmartBreedComboboxProps {
    selectedSpecies: 'Dog' | 'Cat'
    onSelect: (breed: Breed) => void
    selectedBreedName?: string
}

export function SmartBreedCombobox({
    selectedSpecies,
    onSelect,
    selectedBreedName
}: SmartBreedComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [breeds, setBreeds] = React.useState<Breed[]>([])
    const [loading, setLoading] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Fetch breeds when species changes
    React.useEffect(() => {
        async function fetchBreeds() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('breeds')
                    .select(`
            id,
            name,
            is_brachycephalic,
            is_restricted,
            species!inner (
              name
            )
          `)
                    .eq('species.name', selectedSpecies)
                    .order('name')

                if (error) throw error

                if (data) {
                    const mappedBreeds: Breed[] = data.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        species: item.species.name as 'Dog' | 'Cat',
                        is_snub_nosed: item.is_brachycephalic,
                        is_high_risk: item.is_restricted
                    }))
                    setBreeds(mappedBreeds)
                }
            } catch (error) {
                console.error('Error fetching breeds:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBreeds()
        setQuery('') // Reset query on species change
    }, [selectedSpecies])

    // Handle outside click
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredBreeds = query === ''
        ? breeds
        : breeds.filter((breed) =>
            breed.name.toLowerCase().includes(query.toLowerCase())
        )

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <div
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm ring-offset-white placeholder:text-gray-400 focus-within:border-brand-color-01 focus-within:ring-2 focus-within:ring-brand-color-01/20 hover:border-brand-color-01/50 transition-all cursor-text"
                    onClick={() => {
                        setOpen(true)
                        inputRef.current?.focus()
                    }}
                >
                    <div className="flex items-center gap-2 flex-1">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full border-none bg-transparent p-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                            placeholder={`Search ${selectedSpecies} breeds...`}
                            value={open ? query : (selectedBreedName || '')}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setOpen(true)
                            }}
                            onFocus={() => setOpen(true)}
                        />
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 max-h-24 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                        {loading ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">Loading breeds...</div>
                        ) : filteredBreeds.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No breed found.</div>
                        ) : (
                            <ul className="py-1">
                                {filteredBreeds.map((breed) => (
                                    <li
                                        key={breed.id}
                                        className={cn(
                                            "relative cursor-pointer select-none py-1.5 pl-4 pr-9 hover:bg-gray-50 transition-colors",
                                            selectedBreedName === breed.name ? "bg-gray-100 text-gray-900" : "text-gray-900"
                                        )}
                                        onClick={() => {
                                            onSelect(breed)
                                            setQuery('')
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn("block truncate", selectedBreedName === breed.name && "font-semibold")}>
                                                {breed.name}
                                            </span>
                                            {breed.is_snub_nosed && (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                                    Snub-nosed
                                                </span>
                                            )}
                                        </div>
                                        {selectedBreedName === breed.name && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-color-01">
                                                <Check className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
