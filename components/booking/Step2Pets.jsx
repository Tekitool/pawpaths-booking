'use client';

import React, { useRef, useState } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Plus, Trash2, ChevronDown, ChevronUp, Shield, FileText } from 'lucide-react';

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
    const [expandedDetails, setExpandedDetails] = useState({});

    const toggleDetails = (index) => {
        setExpandedDetails(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Add initial pet if empty, ensuring it only runs once
    React.useEffect(() => {
        if (!initialized.current && pets.length === 0) {
            initialized.current = true;
            addPet({
                id: crypto.randomUUID(),
                species_id: '',
                breed_id: '',
                name: '',
                age: '',
                ageUnit: 'years',
                weight: '',
                gender: '',
                microchip_id: '',
                passport_number: '',
                date_of_birth: '',
                medical_alerts: '',
            });
        }
    }, [pets.length, addPet]);

    const handlePetChange = (index, field, value) => {
        // If species changes, reset breed
        if (field === 'species_id') {
            const selectedSpecies = speciesList.find(s => s.id === parseInt(value));
            updatePet(index, {
                [field]: parseInt(value) || '',
                speciesName: selectedSpecies ? selectedSpecies.name : '',
                breed_id: '',
                breedName: ''
            });
        } else if (field === 'breed_id') {
            const selectedBreed = breedsList.find(b => b.id === parseInt(value));
            updatePet(index, {
                [field]: parseInt(value) || '',
                breedName: selectedBreed ? selectedBreed.name : ''
            });
        } else {
            updatePet(index, { [field]: value });
        }
    };

    const handleAddPet = () => {
        addPet({
            id: crypto.randomUUID(),
            species_id: '',
            breed_id: '',
            name: '',
            age: '',
            ageUnit: 'years',
            weight: '',
            gender: '',
            microchip_id: '',
            passport_number: '',
            date_of_birth: '',
            medical_alerts: '',
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
                    <div key={index} className="bg-brand-color-02/20 backdrop-blur-xl border-[0.5px] border-brand-color-02/50 shadow-glow-accent rounded-3xl p-4 sm:p-6 md:p-8 relative hover:shadow-glow-accent hover:shadow-lg transition-all duration-300 group">
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
                                    className="text-system-color-01 hover:text-error hover:bg-error/10 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-300"
                                    title="Remove Pet"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

                            {/* Row 3: Age/DOB & Weight */}
                            <div className="flex gap-4">
                                <Input
                                    id={`pet-${index}-age`}
                                    label="Age"
                                    type="number"
                                    min="0"
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

                            {/* Row 4: Date of Birth (Optional) */}
                            <Input
                                id={`pet-${index}-dob`}
                                label="Date of Birth (Optional)"
                                type="date"
                                value={pet.date_of_birth || ''}
                                onChange={(e) => handlePetChange(index, 'date_of_birth', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                            />

                            {/* Spacer for grid alignment */}
                            <div className="hidden md:block" />

                            {/* Row 5: Special Requirements */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-brand-text-02 mb-2">Special Requirements (Optional)</label>
                                <textarea
                                    value={pet.specialRequirements || ''}
                                    onChange={(e) => handlePetChange(index, 'specialRequirements', e.target.value)}
                                    className="w-full bg-white/50 border border-brand-text-02/20/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-color-01 focus:outline-none focus:bg-white transition-all duration-300 resize-none"
                                    rows="1"
                                    placeholder="Any travel requirements or special needs..."
                                />
                            </div>

                            {/* Collapsible: Compliance & Medical Details */}
                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    onClick={() => toggleDetails(index)}
                                    className="flex items-center gap-2 text-sm font-medium text-brand-color-01 hover:text-brand-color-01/80 transition-colors duration-200"
                                >
                                    {expandedDetails[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    <Shield size={14} />
                                    <span>Compliance & Medical Details (Optional)</span>
                                </button>

                                {expandedDetails[index] && (
                                    <div className="mt-4 pt-4 border-t border-brand-text-02/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Input
                                            id={`pet-${index}-microchip`}
                                            label="Microchip Number"
                                            value={pet.microchip_id || ''}
                                            onChange={(e) => handlePetChange(index, 'microchip_id', e.target.value)}
                                            placeholder="e.g. 900123456789012"
                                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                        />
                                        <Input
                                            id={`pet-${index}-passport`}
                                            label="Pet Passport Number"
                                            value={pet.passport_number || ''}
                                            onChange={(e) => handlePetChange(index, 'passport_number', e.target.value)}
                                            placeholder="e.g. GB123456"
                                            className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                        />
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-brand-text-02 mb-2">
                                                <span className="flex items-center gap-1.5">
                                                    <FileText size={14} />
                                                    Medical Alerts
                                                </span>
                                            </label>
                                            <textarea
                                                value={pet.medical_alerts || ''}
                                                onChange={(e) => handlePetChange(index, 'medical_alerts', e.target.value)}
                                                className="w-full bg-white/50 border border-brand-text-02/20/50 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-brand-color-01 focus:outline-none focus:bg-white transition-all duration-300 resize-none"
                                                rows="2"
                                                placeholder="Allergies, medications, medical conditions..."
                                            />
                                        </div>
                                    </div>
                                )}
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
