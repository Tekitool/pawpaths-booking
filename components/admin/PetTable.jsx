'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Edit, Trash2, History, Dog, Cat, Bird, Search, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PetTable({ pets, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('All');

    // Filter Logic
    const filteredPets = pets.filter(pet => {
        const matchesSearch =
            pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.microchip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.owner?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecies = speciesFilter === 'All' || pet.species?.name === speciesFilter;

        return matchesSearch && matchesSpecies;
    });

    const getSpeciesIcon = (speciesName) => {
        const name = speciesName?.toLowerCase();
        if (name === 'dog') return <Dog size={18} className="text-system-color-03" />;
        if (name === 'cat') return <Cat size={18} className="text-pink-500" />;
        if (name === 'bird') return <Bird size={18} className="text-system-color-02" />;
        return <span className="text-lg">🐾</span>;
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-02/60" size={18} />
                    <input
                        type="text"
                        placeholder="Search Pet Name, Microchip, or Owner..."
                        className="w-full pl-10 pr-4 py-2 bg-white/50 border border-brand-text-02/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Dog', 'Cat'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSpeciesFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${speciesFilter === type
                                ? 'bg-accent/15 text-orange-700 border-accent/50'
                                : 'bg-white text-brand-text-02 border-brand-text-02/20 hover:bg-brand-text-02/5'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Glass Table */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-accent/15/80 border-b border-accent/15 text-xs uppercase tracking-wider text-orange-800 font-bold">
                                <th className="px-6 py-4">Pet Profile</th>
                                <th className="px-6 py-4">Taxonomy</th>
                                <th className="px-6 py-4">Biometrics</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPets.map((pet) => (
                                <tr key={pet.id} className="hover:bg-accent/15/50 transition-colors group">
                                    {/* Col 1: Pet Profile */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-text-02/10 relative overflow-hidden flex-shrink-0 border border-brand-text-02/20">
                                                {pet.photos && pet.photos.length > 0 ? (
                                                    <Image src={pet.photos[0]} alt={pet.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-accent/15">
                                                        {getSpeciesIcon(pet.species?.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-brand-text-02 text-sm">{pet.name}</div>
                                                <div className="text-[10px] font-mono text-brand-text-02/60">
                                                    {pet.microchip_number || 'No Microchip'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Col 2: Taxonomy */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-medium text-brand-text-02">{pet.breed?.name || 'Unknown Breed'}</span>
                                            <span className="text-[10px] px-2 py-0.5 bg-brand-text-02/10 text-brand-text-02/80 rounded-full font-bold uppercase tracking-wide">
                                                {pet.species?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Col 3: Biometrics */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-brand-text-02">{pet.weight} kg</span>
                                            <div className="flex items-center gap-1 text-xs text-brand-text-02/80">
                                                <span>{pet.age} {pet.ageUnit}</span>
                                                {pet.gender && (
                                                    <span className={`font-bold ${pet.gender.toLowerCase() === 'male' ? 'text-system-color-03' : 'text-pink-500'}`}>
                                                        {pet.gender === 'Male' ? '♂' : '♀'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Col 4: Owner */}
                                    <td className="px-6 py-4">
                                        {pet.owner ? (
                                            <Link href={`/admin/customers?id=${pet.owner.id}`} className="text-sm font-medium text-info hover:text-accent hover:underline transition-colors">
                                                {pet.owner.display_name}
                                            </Link>
                                        ) : (
                                            <span className="text-sm text-brand-text-02/60 italic">Unassigned</span>
                                        )}
                                    </td>

                                    {/* Col 5: Status */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col gap-1 items-center">
                                            {pet.breed?.is_brachycephalic && (
                                                <span className="px-2 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded-full border border-error/30">
                                                    Brachycephalic
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 bg-success/15 text-success text-[10px] font-bold rounded-full border border-success/30">
                                                Travel Ready
                                            </span>
                                        </div>
                                    </td>

                                    {/* Col 6: Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-brand-text-02/60 hover:text-system-color-03 hover:bg-info/10 rounded-lg transition-colors" title="History">
                                                <History size={16} />
                                            </button>
                                            <button className="p-1.5 text-brand-text-02/60 hover:text-accent hover:bg-accent/15 rounded-lg transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(pet.id)}
                                                className="p-1.5 text-brand-text-02/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-brand-text-02/80 italic">
                                        No pets found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
