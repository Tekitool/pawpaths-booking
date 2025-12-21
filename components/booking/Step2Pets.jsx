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
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary">Pet Information</h2>
                <p className="text-gray-600">Tell us about your furry friends</p>
            </div>
            <div className="space-y-6">
                {pets.map((pet, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 relative border border-[#4d341a]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <h3>Pet {index + 1}</h3>
                            </div>
                            {pets.length > 1 && (
                                <button
                                    onClick={() => removePet(index)}
                                    className="text-error hover:bg-error/10 p-2 rounded-full transition-colors"
                                    title="Remove Pet"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Row 1: Type & Breed */}
                            <Select
                                id={`pet-${index}-type`}
                                label="Pet Type"
                                value={pet.type || ''}
                                onChange={(e) => handlePetChange(index, 'type', e.target.value)}
                                options={PET_TYPES}
                            />
                            <Select
                                id={`pet-${index}-breed`}
                                label="Breed"
                                value={pet.breed || ''}
                                onChange={(e) => handlePetChange(index, 'breed', e.target.value)}
                                options={getBreeds(pet.type)}
                            />

                            {/* Row 2: Name & Gender */}
                            <Input
                                id={`pet-${index}-name`}
                                label="Pet Name"
                                value={pet.name || ''}
                                onChange={(e) => handlePetChange(index, 'name', e.target.value)}
                                placeholder="e.g. Max"
                            />
                            <Select
                                id={`pet-${index}-gender`}
                                label="Gender"
                                value={pet.gender || ''}
                                onChange={(e) => handlePetChange(index, 'gender', e.target.value)}
                                options={GENDERS}
                            />

                            {/* Row 3: Age & Weight */}
                            <div className="flex gap-2">
                                <Input
                                    id={`pet-${index}-age`}
                                    label="Age"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={pet.age || ''}
                                    onChange={(e) => handlePetChange(index, 'age', e.target.value)}
                                    className="flex-1"
                                />
                                <Select
                                    id={`pet-${index}-ageUnit`}
                                    label="Unit"
                                    value={pet.ageUnit || 'years'}
                                    onChange={(e) => handlePetChange(index, 'ageUnit', e.target.value)}
                                    options={AGE_UNITS}
                                    className="w-32"
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
                            />
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="tonal"
                onClick={handleAddPet}
                className="w-full border-dashed border-2 border-primary bg-transparent hover:bg-primary-container/20"
            >
                <Plus size={18} className="mr-2" />
                Add Another Pet
            </Button>
        </div>
    );
}
