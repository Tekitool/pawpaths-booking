'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Shield, FileText, Loader2, Check } from 'lucide-react';

const FALLBACK_GENDERS = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Desexed', label: 'Desexed' },
    { value: 'Unknown', label: 'Unknown' },
];

const AGE_UNITS = [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
];

// ── DOB ↔ Age helpers (mirrored from Step2Pets) ───────────────────────────────

const calculateDobFromAge = (age, unit) => {
    const num = parseFloat(age);
    if (!age || isNaN(num) || num < 0) return '';
    const totalMonths = unit === 'years' ? Math.round(num * 12) : Math.round(num);
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth() - totalMonths, today.getDate());
    return d.toISOString().split('T')[0];
};

const calculateAgeFromDob = (dobString) => {
    if (!dobString) return { age: '', ageUnit: 'years' };
    const dob = new Date(dobString + 'T12:00:00');
    const today = new Date();
    if (dob > today) return { age: '', ageUnit: 'years' };

    let years = today.getFullYear() - dob.getFullYear();
    const mDiff = today.getMonth() - dob.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) years--;

    if (years >= 1) return { age: String(years), ageUnit: 'years' };

    let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) months--;
    return { age: String(Math.max(0, months)), ageUnit: 'months' };
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone pet details form for the admin drawer.
 * No Zustand — drives local state, calls onSubmit(data) when saved.
 *
 * Props:
 *   initialData   — pre-filled values for edit mode (empty object for add)
 *   speciesList   — [{ id, name }]
 *   breedsList    — [{ id, name, species_id, default_image_path }]
 *   genderOptions — [{ value, label }]
 *   onSubmit      — async fn(formData) → called with validated form state
 *   onCancel      — fn() closes the drawer
 *   isSaving      — boolean; shows spinner on Save button while in flight
 */
export default function PetDetailsForm({
    initialData = {},
    speciesList = [],
    breedsList = [],
    genderOptions = [],
    onSubmit,
    onCancel,
    isSaving = false,
}) {
    const [pet, setPet] = useState({
        name: initialData.name || '',
        species_id: initialData.species_id || '',
        breed_id: initialData.breed_id || '',
        gender: initialData.gender || '',
        age: initialData.age !== undefined && initialData.age !== null ? String(initialData.age) : '',
        ageUnit: initialData.ageUnit || 'years',
        weight: initialData.weight !== undefined && initialData.weight !== null ? String(initialData.weight) : '',
        date_of_birth: initialData.date_of_birth || '',
        microchip_id: initialData.microchip_id || '',
        passport_number: initialData.passport_number || '',
        medical_alerts: Array.isArray(initialData.medicalAlerts)
            ? initialData.medicalAlerts.map(a => (typeof a === 'string' ? a : a.label || a.name || '')).join(', ')
            : (initialData.medical_alerts || ''),
        specialRequirements: initialData.specialRequirements || '',
    });

    const [showCompliance, setShowCompliance] = useState(
        !!(initialData.microchip_id || initialData.passport_number || (initialData.medicalAlerts?.length > 0))
    );

    const [errors, setErrors] = useState({});

    // ── Field change handlers ─────────────────────────────────────────────

    const handleChange = (field, value) => {
        setPet(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    };

    const handleSpeciesChange = (value) => {
        const selectedSpecies = speciesList.find(s => s.id === parseInt(value));
        setPet(prev => ({
            ...prev,
            species_id: parseInt(value) || '',
            speciesName: selectedSpecies?.name || '',
            breed_id: '',
        }));
    };

    const handleBreedChange = (value) => {
        const selectedBreed = breedsList.find(b => b.id === parseInt(value));
        setPet(prev => ({
            ...prev,
            breed_id: parseInt(value) || '',
            breedName: selectedBreed?.name || '',
        }));
    };

    const handleAgeOrUnitChange = (field, value) => {
        const newAge = field === 'age' ? value : pet.age;
        const newUnit = field === 'ageUnit' ? value : pet.ageUnit;
        const dob = calculateDobFromAge(newAge, newUnit);
        setPet(prev => ({
            ...prev,
            [field]: value,
            date_of_birth: dob,
        }));
    };

    const handleDobChange = (dateStr) => {
        const { age, ageUnit } = calculateAgeFromDob(dateStr);
        setPet(prev => ({ ...prev, date_of_birth: dateStr, age, ageUnit }));
    };

    // ── Options helpers ───────────────────────────────────────────────────

    const speciesOptions = speciesList.map(s => ({ value: s.id, label: s.name }));

    const breedOptions = () => {
        if (!pet.species_id) return [];
        const speciesBreeds = breedsList.filter(b => b.species_id === parseInt(pet.species_id));
        const mixedBreed = speciesBreeds.find(b => b.name === 'Mixed Breed');
        const sorted = speciesBreeds
            .filter(b => b.name !== 'Mixed Breed')
            .map(b => ({ value: b.id, label: b.name }));
        if (mixedBreed) sorted.push({ value: mixedBreed.id, label: 'Other / Unknown' });
        return sorted;
    };

    const genders = genderOptions.length > 0 ? genderOptions : FALLBACK_GENDERS;

    // ── Validation ────────────────────────────────────────────────────────

    const validate = () => {
        const errs = {};
        if (!pet.name.trim()) errs.name = 'Pet name is required';
        if (!pet.species_id) errs.species_id = 'Pet type is required';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        onSubmit(pet);
    };

    // ── Input style shared ─────────────────────────────────────────────

    const inputCls = 'bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200';

    return (
        <div className="space-y-5">
            {/* Row 1: Type & Breed */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Select
                        id="admin-pet-species"
                        label="Pet Type *"
                        value={pet.species_id || ''}
                        onChange={e => handleSpeciesChange(e.target.value)}
                        options={speciesOptions}
                        className={inputCls}
                    />
                    {errors.species_id && <p className="text-xs text-error mt-1">{errors.species_id}</p>}
                </div>
                <Select
                    id="admin-pet-breed"
                    label="Breed"
                    value={pet.breed_id || ''}
                    onChange={e => handleBreedChange(e.target.value)}
                    options={breedOptions()}
                    disabled={!pet.species_id}
                    className={`${inputCls} disabled:opacity-50`}
                />
            </div>

            {/* Row 2: Name & Gender */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        id="admin-pet-name"
                        label="Pet Name *"
                        value={pet.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="e.g. Max"
                        className={inputCls}
                    />
                    {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
                </div>
                <Select
                    id="admin-pet-gender"
                    label="Gender"
                    value={pet.gender || ''}
                    onChange={e => handleChange('gender', e.target.value)}
                    options={genders}
                    className={inputCls}
                />
            </div>

            {/* Row 3: Age | Unit | DOB | Weight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Input
                    id="admin-pet-age"
                    label="Age"
                    type="number"
                    min="0"
                    max="99"
                    value={pet.age}
                    onChange={e => handleAgeOrUnitChange('age', e.target.value)}
                    className={inputCls}
                />
                <Select
                    id="admin-pet-ageUnit"
                    label="Unit"
                    value={pet.ageUnit}
                    onChange={e => handleAgeOrUnitChange('ageUnit', e.target.value)}
                    options={AGE_UNITS}
                    className={inputCls}
                />
                <Input
                    id="admin-pet-dob"
                    label="Date of Birth"
                    type="date"
                    value={pet.date_of_birth || ''}
                    onChange={e => handleDobChange(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={inputCls}
                />
                <Input
                    id="admin-pet-weight"
                    label="Weight (kg)"
                    type="number"
                    min="0.1"
                    max="150"
                    step="0.1"
                    value={pet.weight}
                    onChange={e => handleChange('weight', e.target.value)}
                    placeholder="e.g. 25"
                    className={inputCls}
                />
            </div>

            {/* Row 4: Special Requirements */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requirements
                </label>
                <textarea
                    value={pet.specialRequirements}
                    onChange={e => handleChange('specialRequirements', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-color-01 focus:outline-none focus:bg-white transition-all duration-200 resize-none"
                    rows="2"
                    placeholder="Any travel requirements or special needs..."
                />
            </div>

            {/* Compliance & Medical (collapsible) */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowCompliance(p => !p)}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-color-01 hover:text-brand-color-01/80 transition-colors"
                >
                    <Shield size={14} />
                    Compliance & Medical Details
                    <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </button>

                {showCompliance && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Input
                            id="admin-pet-microchip"
                            label="Microchip Number"
                            value={pet.microchip_id}
                            onChange={e => handleChange('microchip_id', e.target.value)}
                            placeholder="e.g. 900123456789012"
                            className={inputCls}
                        />
                        <Input
                            id="admin-pet-passport"
                            label="Pet Passport Number"
                            value={pet.passport_number}
                            onChange={e => handleChange('passport_number', e.target.value)}
                            placeholder="e.g. GB123456"
                            className={inputCls}
                        />
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                <FileText size={14} />
                                Medical Alerts
                            </label>
                            <textarea
                                value={pet.medical_alerts}
                                onChange={e => handleChange('medical_alerts', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-color-01 focus:outline-none focus:bg-white transition-all duration-200 resize-none"
                                rows="2"
                                placeholder="Allergies, medications, medical conditions..."
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl bg-brand-color-01 text-white font-bold text-sm hover:bg-brand-color-01/90 shadow-lg shadow-brand-color-01/20 hover:shadow-brand-color-01/30 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                        <><Check size={16} /> Save Pet</>
                    )}
                </button>
            </div>
        </div>
    );
}
