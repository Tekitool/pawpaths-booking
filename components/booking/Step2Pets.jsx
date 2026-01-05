'use client';

import React, { useRef } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

const GENDERS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Desexed', label: 'Desexed' },
    { value: 'Unknown', label: 'Unknown' },
];

const AGE_UNITS = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
];

export default function Step2Pets({ speciesList = [], breedsList = [], genderOptions = [] }) {
    const { formData, addPet, removePet, updatePet } = useBookingStore();
    const { pets } = formData;
    const initialized = useRef(false);

    // Add initial pet if empty, ensuring it only runs once
    React.useEffect(() => {
        if (!initialized.current && pets.length === 0) {
            initialized.current = true;
            addPet({
                species_id: '',
                breed_id: '',
                name: '',
                age: '',
                ageUnit: 'years',
                weight: '',
                gender: '',
            });
        }
    }, [pets.length, addPet]);

    const handlePetChange = (index, field, value) => {
        // If species changes, reset breed
        if (field === 'species_id') {
            updatePet(index, { [field]: parseInt(value) || '', breed_id: '' });
        } else if (field === 'breed_id') {
            updatePet(index, { [field]: parseInt(value) || '' });
        } else {
            updatePet(index, { [field]: value });
        }
    };

    const handleAddPet = () => {
        addPet({
            species_id: '',
            breed_id: '',
            name: '',
            age: '',
            ageUnit: 'years',
            weight: '',
            gender: '',
        });
    };

    const getSpeciesOptions = () => {
        return speciesList.map(s => ({
            value: s.id,
            label: s.name
        }));
    };

    const getBreedOptions = (speciesId) => {
        if (!speciesId) return [];
        return breedsList
            .filter(b => b.species_id === parseInt(speciesId))
            .map(b => ({
                value: b.id,
                label: b.name
            }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-brand-color-01 tracking-tight">Pet Information</h2>
                <p className="text-brand-text-02/80 mt-2">Tell us about your furry friends</p>
            </div>
            <div className="space-y-8">
                {pets.map((pet, index) => (
                    <div key={index} className="bg-brand-color-02/20 backdrop-blur-xl border-[0.5px] border-brand-color-02/50 shadow-glow-accent rounded-3xl p-6 md:p-8 relative hover:shadow-glow-accent hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-text-02/20">
                            <div className="flex items-center gap-3 text-brand-color-01 font-bold text-lg">
                                <span className="bg-brand-color-02 text-brand-color-01 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm border border-brand-color-04">
                                    {index + 1}
                                </span>
                                <h3>Pet {index + 1}</h3>
                            </div>
                            {pets.length > 1 && (
                                <button
                                    onClick={() => removePet(index)}
                                    className="text-system-color-01 hover:text-error hover:bg-error/10 p-2 rounded-xl transition-all duration-300"
                                    title="Remove Pet"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Row 1: Type & Breed */}
                            <Select
                                id={`pet-${index}-species`}
                                label="Pet Type"
                                value={pet.species_id || ''}
                                onChange={(e) => handlePetChange(index, 'species_id', e.target.value)}
                                options={getSpeciesOptions()}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />
                            <Select
                                id={`pet-${index}-breed`}
                                label="Breed"
                                value={pet.breed_id || ''}
                                onChange={(e) => handlePetChange(index, 'breed_id', e.target.value)}
                                options={getBreedOptions(pet.species_id)}
                                disabled={!pet.species_id}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300 disabled:opacity-50"
                            />

                            {/* Row 2: Name & Gender */}
                            <Input
                                id={`pet-${index}-name`}
                                label="Pet Name"
                                value={pet.name || ''}
                                onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                                placeholder="e.g. Max"
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />
                            <Select
                                id={`pet-${index}-gender`}
                                label="Gender"
                                value={pet.gender || ''}
                                onChange={(e) => handlePetChange(index, 'gender', e.target.value)}
                                options={genderOptions.length > 0 ? genderOptions : GENDERS}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />

                            {/* Row 3: Age & Weight */}
                            <div className="flex gap-4">
                                <Input
                                    id={`pet-${index}-age`}
                                    label="Age"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={pet.age || ''}
                                    onChange={(e) => handlePetChange(index, 'age', e.target.value)}
                                    className="flex-1 bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                />
                                <Select
                                    id={`pet-${index}-ageUnit`}
                                    label="Unit"
                                    value={pet.ageUnit || 'years'}
                                    onChange={(e) => handlePetChange(index, 'ageUnit', e.target.value)}
                                    options={AGE_UNITS}
                                    className="w-32 bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                />
                            </div>
                            <Input
                                id={`pet-${index}-weight`}
                                label="Weight (kg)"
                                type="number"
                                min="1"
                                max="99"
                                value={pet.weight || ''}
                                onChange={(e) => handlePetChange(index, 'weight', e.target.value)}
                                placeholder="e.g. 25"
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />

                            {/* Row 4: Special Requirements */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-brand-text-02 mb-2">Special Requirements (Optional)</label>
                                <textarea
                                    value={pet.specialRequirements || ''}
                                    onChange={(e) => handlePetChange(index, 'specialRequirements', e.target.value)}
                                    className="w-full bg-white/50 border border-brand-text-02/20/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-color-01 focus:outline-none focus:bg-white transition-all duration-300 resize-none"
                                    rows="1"
                                    placeholder="Any medical conditions or special needs..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="tonal"
                onClick={handleAddPet}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-brand-color-01/30 bg-white/30 hover:bg-brand-color-01/5 hover:border-brand-color-01 text-brand-color-01 transition-all duration-300 group"
            >
                <div className="flex items-center justify-center gap-2">
                    <div className="p-1 rounded-full bg-brand-color-01/10 group-hover:bg-brand-color-01 group-hover:text-white transition-colors duration-300">
                        <Plus size={18} />
                    </div>
                    <span className="font-semibold">Add Another Pet</span>
                </div>
            </Button>
        </div>
    );
}
