'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, PawPrint, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSpecies, getBreeds, upsertSpecies, upsertBreed, deleteRecord } from '@/lib/actions/manage-master-data';

import SecurityModal from '@/components/ui/SecurityModal';

export default function TaxonomyManagerModal({ isOpen, onClose }) {
    const [speciesList, setSpeciesList] = useState([]);
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [breedsList, setBreedsList] = useState([]);
    const [loadingSpecies, setLoadingSpecies] = useState(true);
    const [loadingBreeds, setLoadingBreeds] = useState(false);

    // Forms State
    const [showAddSpecies, setShowAddSpecies] = useState(false);
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [newSpeciesIata, setNewSpeciesIata] = useState('');

    const [showAddBreed, setShowAddBreed] = useState(false);
    const [newBreedName, setNewBreedName] = useState('');
    const [isBrachy, setIsBrachy] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false);

    // Security Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSpecies = async () => {
        setLoadingSpecies(true);
        const data = await getSpecies();
        setSpeciesList(data);
        setLoadingSpecies(false);
    };

    const fetchBreeds = async (speciesId) => {
        setLoadingBreeds(true);
        const data = await getBreeds(speciesId);
        setBreedsList(data);
        setLoadingBreeds(false);
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => fetchSpecies(), 0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedSpecies) {
            setTimeout(() => fetchBreeds(selectedSpecies.id), 0);
        } else {
            setTimeout(() => setBreedsList([]), 0);
        }
    }, [selectedSpecies]);

    const handleAddSpecies = async () => {
        if (!newSpeciesName) return toast.error("Name is required");

        const result = await upsertSpecies({
            name: newSpeciesName,
            iata_code: newSpeciesIata
        });

        if (result.success) {
            toast.success("Species added");
            setNewSpeciesName('');
            setNewSpeciesIata('');
            setShowAddSpecies(false);
            fetchSpecies();
        } else {
            toast.error(result.message);
        }
    };

    const handleAddBreed = async () => {
        if (!newBreedName) return toast.error("Name is required");
        if (!selectedSpecies) return;

        const result = await upsertBreed({
            species_id: selectedSpecies.id,
            name: newBreedName,
            is_brachycephalic: isBrachy,
            is_restricted: isRestricted
        });

        if (result.success) {
            toast.success("Breed added");
            setNewBreedName('');
            setIsBrachy(false);
            setIsRestricted(false);
            setShowAddBreed(false);
            fetchBreeds(selectedSpecies.id);
        } else {
            toast.error(result.message);
        }
    };

    const handleDeleteClick = (table, id) => {
        setDeleteTarget({ table, id });
    };

    const executeDelete = async (reason) => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        // Ideally log the reason somewhere, but for now just proceed
        const result = await deleteRecord(deleteTarget.table, deleteTarget.id);

        if (result.success) {
            toast.success("Deleted successfully");
            if (deleteTarget.table === 'species') {
                fetchSpecies();
                if (selectedSpecies?.id === deleteTarget.id) setSelectedSpecies(null);
            } else {
                fetchBreeds(selectedSpecies.id);
            }
            setDeleteTarget(null);
        } else {
            toast.error(result.message);
        }
        setIsDeleting(false);
    };

    const handleToggleBreedProp = async (breed, prop) => {
        // Optimistic update
        const updatedBreed = { ...breed, [prop]: !breed[prop] };
        setBreedsList(prev => prev.map(b => b.id === breed.id ? updatedBreed : b));

        const result = await upsertBreed(updatedBreed);
        if (!result.success) {
            toast.error("Update failed");
            // Revert
            setBreedsList(prev => prev.map(b => b.id === breed.id ? breed : b));
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-brand-text-02/20 flex justify-between items-center bg-white">
                        <div>
                            <h2 className="text-gray-900 flex items-center gap-3">
                                <PawPrint className="text-brand-color-01" /> Taxonomy Manager
                            </h2>
                            <p className="text-brand-text-02/80 text-sm mt-1">Manage species and their associated breeds.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-brand-text-02/10 rounded-full transition-colors text-brand-text-02/60 hover:text-brand-text-02">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* Left Column: Species */}
                        <div className="w-1/3 border-r border-brand-text-02/20 bg-brand-text-02/5 flex flex-col">
                            <div className="p-4 border-b border-brand-text-02/20 flex justify-between items-center bg-white">
                                <h3 className="text-brand-text-02">Species</h3>
                                <button
                                    onClick={() => setShowAddSpecies(true)}
                                    className="p-2 bg-brand-color-01/10 text-brand-color-01 rounded-lg hover:bg-brand-color-01/20 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {showAddSpecies && (
                                <div className="p-4 bg-white border-b border-brand-text-02/20 animate-in slide-in-from-top-2">
                                    <input
                                        className="w-full mb-2 px-3 py-2 rounded-lg border border-brand-text-02/20 text-sm"
                                        placeholder="Species Name (e.g. Dog)"
                                        value={newSpeciesName}
                                        onChange={e => setNewSpeciesName(e.target.value)}
                                    />
                                    <input
                                        className="w-full mb-2 px-3 py-2 rounded-lg border border-brand-text-02/20 text-sm"
                                        placeholder="IATA Code (e.g. DOG)"
                                        value={newSpeciesIata}
                                        onChange={e => setNewSpeciesIata(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleAddSpecies} className="flex-1 bg-brand-color-01 text-white py-1.5 rounded-lg text-sm font-medium">Save</button>
                                        <button onClick={() => setShowAddSpecies(false)} className="flex-1 bg-brand-text-02/10 text-brand-text-02 py-1.5 rounded-lg text-sm font-medium">Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {loadingSpecies ? (
                                    <div className="text-center py-8 text-brand-text-02/60 text-sm">Loading...</div>
                                ) : speciesList.map(species => (
                                    <div
                                        key={species.id}
                                        onClick={() => setSelectedSpecies(species)}
                                        className={`
                                            p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group
                                            ${selectedSpecies?.id === species.id ? 'bg-white shadow-md border-brand-color-01/20 border' : 'hover:bg-brand-text-02/10 border border-transparent'}
                                        `}
                                    >
                                        <div>
                                            <div className="font-bold text-gray-900">{species.name}</div>
                                            <div className="text-xs text-brand-text-02/80">{species.iata_code || '-'}</div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick('species', species.id); }}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-brand-text-02/60 hover:text-system-color-01 hover:bg-error/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Breeds */}
                        <div className="flex-1 flex flex-col bg-white">
                            {selectedSpecies ? (
                                <>
                                    <div className="p-4 border-b border-brand-text-02/20 flex justify-between items-center">
                                        <h3 className="text-brand-text-02">Breeds for <span className="text-brand-color-01">{selectedSpecies.name}</span></h3>
                                        <button
                                            onClick={() => setShowAddBreed(true)}
                                            className="px-3 py-2 bg-brand-color-01 text-white rounded-lg hover:bg-brand-color-01/90 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Add Breed
                                        </button>
                                    </div>

                                    {showAddBreed && (
                                        <div className="p-4 bg-brand-text-02/5 border-b border-brand-text-02/20 animate-in slide-in-from-top-2">
                                            <div className="flex gap-4 mb-3">
                                                <input
                                                    className="flex-1 px-3 py-2 rounded-lg border border-brand-text-02/20 text-sm"
                                                    placeholder="Breed Name"
                                                    value={newBreedName}
                                                    onChange={e => setNewBreedName(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-4 mb-3">
                                                <label className="flex items-center gap-2 text-sm text-brand-text-02 cursor-pointer">
                                                    <input type="checkbox" checked={isBrachy} onChange={e => setIsBrachy(e.target.checked)} className="rounded text-brand-color-01 focus:ring-brand-color-01" />
                                                    Brachycephalic (Snub-nosed)
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-brand-text-02 cursor-pointer">
                                                    <input type="checkbox" checked={isRestricted} onChange={e => setIsRestricted(e.target.checked)} className="rounded text-brand-color-01 focus:ring-brand-color-01" />
                                                    Restricted Breed
                                                </label>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setShowAddBreed(false)} className="px-4 py-1.5 bg-white border border-brand-text-02/20 text-brand-text-02 rounded-lg text-sm font-medium">Cancel</button>
                                                <button onClick={handleAddBreed} className="px-4 py-1.5 bg-brand-color-01 text-white rounded-lg text-sm font-medium">Save Breed</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-y-auto p-4">
                                        <table className="w-full">
                                            <thead className="text-xs text-brand-text-02/80 uppercase bg-brand-text-02/5/50">
                                                <tr>
                                                    <th className="text-left py-2 px-3 font-medium">Breed Name</th>
                                                    <th className="text-center py-2 px-3 font-medium">Brachy</th>
                                                    <th className="text-center py-2 px-3 font-medium">Restricted</th>
                                                    <th className="text-right py-2 px-3 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {loadingBreeds ? (
                                                    <tr><td colSpan="4" className="text-center py-8 text-brand-text-02/60">Loading breeds...</td></tr>
                                                ) : breedsList.length === 0 ? (
                                                    <tr><td colSpan="4" className="text-center py-8 text-brand-text-02/60">No breeds found. Add one above.</td></tr>
                                                ) : breedsList.map(breed => (
                                                    <tr key={breed.id} className="hover:bg-brand-text-02/5 transition-colors group">
                                                        <td className="py-3 px-3 text-sm font-medium text-gray-900">{breed.name}</td>
                                                        <td className="py-3 px-3 text-center">
                                                            <button
                                                                onClick={() => handleToggleBreedProp(breed, 'is_brachycephalic')}
                                                                className={`px-2 py-1 rounded text-xs font-bold ${breed.is_brachycephalic ? 'bg-accent/15 text-orange-700' : 'bg-brand-text-02/10 text-brand-text-02/60'}`}
                                                            >
                                                                {breed.is_brachycephalic ? 'YES' : 'NO'}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-3 text-center">
                                                            <button
                                                                onClick={() => handleToggleBreedProp(breed, 'is_restricted')}
                                                                className={`px-2 py-1 rounded text-xs font-bold ${breed.is_restricted ? 'bg-error/10 text-error' : 'bg-brand-text-02/10 text-brand-text-02/60'}`}
                                                            >
                                                                {breed.is_restricted ? 'YES' : 'NO'}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-3 text-right">
                                                            <button
                                                                onClick={() => handleDeleteClick('breeds', breed.id)}
                                                                className="p-1.5 text-brand-text-02/60 hover:text-system-color-01 hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-brand-text-02/60">
                                    <PawPrint size={48} className="mb-4 opacity-20" />
                                    <p>Select a species to manage breeds</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <SecurityModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title={`Delete ${deleteTarget?.table === 'species' ? 'Species' : 'Breed'}`}
                actionType="danger"
                isLoading={isDeleting}
                zIndex="z-[110]"
            />
        </>
    );
}
