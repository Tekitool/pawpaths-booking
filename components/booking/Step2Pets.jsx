'use client';

import React, { useRef } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Plus, Trash2, Dog, Cat } from 'lucide-react';
import { DOG_BREEDS, CAT_BREEDS } from '@/lib/constants/breeds';

const PET_TYPES = [
    { value: 'Dog', label: 'Dog' },
    { value: 'Cat', label: 'Cat' },
];

const GENDERS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
];

const AGE_UNITS = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
];

export default function Step2Pets() {
    const { formData, addPet, removePet, updatePet } = useBookingStore();
    const { pets } = formData;
    const initialized = useRef(false);

    // Add initial pet if empty, ensuring it only runs once
    React.useEffect(() => {
        if (!initialized.current && pets.length === 0) {
            initialized.current = true;
            addPet({
                type: 'Dog',
                name: '',
                breed: '',
                age: '',
                ageUnit: 'years',
                weight: '',
                gender: '',
            });
        }
    }, [pets.length, addPet]);

    const handlePetChange = (index, field, value) => {
        // If type changes, reset breed
        if (field === 'type') {
            updatePet(index, { [field]: value, breed: '' });
        } else {
            updatePet(index, { [field]: value });
        }
    };

    const handleAddPet = () => {
        addPet({
            type: 'Dog',
            name: '',
            breed: '',
            age: '',
            ageUnit: 'years',
            weight: '',
            gender: '',
        });
    };

    const getBreeds = (type) => {
        return type === 'Cat' ? CAT_BREEDS : DOG_BREEDS;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary tracking-tight">Pet Information</h2>
                <p className="text-gray-500 mt-2">Tell us about your furry friends</p>
            </div>
            <div className="space-y-8">
                {pets.map((pet, index) => (
                    <div key={index} className="bg-gradient-to-br from-[#fffdee] to-[#fffbd9] backdrop-blur-xl border-[0.5px] border-[#fff7c0] shadow-[0_4px_20px_rgba(255,247,192,0.3)] rounded-3xl p-6 md:p-8 relative hover:shadow-[0_8px_30px_rgba(255,247,192,0.4)] transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3 text-primary font-bold text-lg">
                                <span className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                                    {index + 1}
                                </span>
                                <h3>Pet {index + 1}</h3>
                            </div>
                            {pets.length > 1 && (
                                <button
                                    onClick={() => removePet(index)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all duration-300"
                                    title="Remove Pet"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Row 1: Type & Breed */}
                            <Select
                                id={`pet-${index}-type`}
                                label="Pet Type"
                                value={pet.type || ''}
                                onChange={(e) => handlePetChange(index, 'type', e.target.value)}
                                options={PET_TYPES}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />
                            <Select
                                id={`pet-${index}-breed`}
                                label="Breed"
                                value={pet.breed || ''}
                                onChange={(e) => handlePetChange(index, 'breed', e.target.value)}
                                options={getBreeds(pet.type)}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />

                            {/* Row 2: Name & Gender */}
                            <Input
                                id={`pet-${index}-name`}
                                label="Pet Name"
                                value={pet.name || ''}
                                onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                                placeholder="e.g. Max"
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />
                            <Select
                                id={`pet-${index}-gender`}
                                label="Gender"
                                value={pet.gender || ''}
                                onChange={(e) => handlePetChange(index, 'gender', e.target.value)}
                                options={GENDERS}
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
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
                                    className="flex-1 bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                                />
                                <Select
                                    id={`pet-${index}-ageUnit`}
                                    label="Unit"
                                    value={pet.ageUnit || 'years'}
                                    onChange={(e) => handlePetChange(index, 'ageUnit', e.target.value)}
                                    options={AGE_UNITS}
                                    className="w-32 bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
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
                                className="bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-300"
                            />

                            {/* Row 4: Special Requirements */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements (Optional)</label>
                                <textarea
                                    value={pet.specialRequirements || ''}
                                    onChange={(e) => handlePetChange(index, 'specialRequirements', e.target.value)}
                                    className="w-full bg-white/50 border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none focus:bg-white transition-all duration-300 resize-none"
                                    rows="3"
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
                className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/30 bg-white/30 hover:bg-primary/5 hover:border-primary text-primary transition-all duration-300 group"
            >
                <div className="flex items-center justify-center gap-2">
                    <div className="p-1 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Plus size={18} />
                    </div>
                    <span className="font-semibold">Add Another Pet</span>
                </div>
            </Button>
        </div>
    );
}
