import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { dogBreeds, catBreeds } from '@/lib/constants/breeds';

export default function PetDetailsSection({ petNumber, petData, onChange, onRemove, errors = {} }) {
    const [breedOptions, setBreedOptions] = useState([]);

    useEffect(() => {
        if (petData.type === 'Dog') {
            setBreedOptions(dogBreeds);
        } else if (petData.type === 'Cat') {
            setBreedOptions(catBreeds);
        } else {
            setBreedOptions([]);
        }
    }, [petData.type]);

    const handleChange = (field, value) => {
        onChange(petNumber, field, value);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-pawpaths-brown">Pet #{petNumber + 1}</h3>
                {petNumber > 0 && (
                    <button
                        type="button"
                        onClick={() => onRemove(petNumber)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove Pet"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pet Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type *</label>
                    <select
                        value={petData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className={`w-full bg-pawpaths-cream border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select Type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>

                {/* Breed */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed *</label>
                    <select
                        value={petData.breed}
                        onChange={(e) => handleChange('breed', e.target.value)}
                        disabled={!petData.type}
                        className={`w-full bg-pawpaths-cream border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.breed ? 'border-red-500' : 'border-gray-300'} disabled:opacity-50`}
                    >
                        <option value="">Select Breed</option>
                        {breedOptions.map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                        ))}
                    </select>
                    {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
                    <input
                        type="text"
                        value={petData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full bg-pawpaths-cream border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. Max"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Age */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (Years) *</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={petData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        className={`w-full bg-pawpaths-cream border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. 3"
                    />
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>

                {/* Weight */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={petData.weight}
                        onChange={(e) => handleChange('weight', e.target.value)}
                        className={`w-full bg-pawpaths-cream border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. 12.5"
                    />
                    {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                </div>

                {/* Special Requirements */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements (Optional)</label>
                    <textarea
                        value={petData.specialRequirements}
                        onChange={(e) => handleChange('specialRequirements', e.target.value)}
                        className="w-full bg-pawpaths-cream border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none"
                        rows="2"
                        placeholder="Any medical conditions or special needs..."
                    />
                </div>
            </div>
        </div>
    );
}
