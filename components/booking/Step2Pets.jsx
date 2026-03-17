'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import useBookingStore from '@/lib/store/booking-store';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage';
import Button from '@/components/ui/Button';
import { Plus, Trash2, ChevronDown, ChevronUp, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ── Bidirectional Age ↔ DOB pure helpers ─────────────────────────────────────

// Path A: Age + Unit → estimated DOB
// Uses calendar arithmetic (not fixed 365 days) to handle leap years correctly.
const calculateDobFromAge = (age, unit) => {
    const num = parseFloat(age);
    if (!age || isNaN(num) || num < 0) return '';
    const totalMonths = unit === 'years' ? Math.round(num * 12) : Math.round(num);
    const today = new Date();
    // new Date(y, m, d) handles month underflow automatically (e.g. Jan - 3 → Oct prev year)
    const d = new Date(today.getFullYear(), today.getMonth() - totalMonths, today.getDate());
    return d.toISOString().split('T')[0];
};

// Path B: DOB → exact Age + Unit
// Appends T12:00:00 to neutralise timezone-driven off-by-one-day shifts.
const calculateAgeFromDob = (dobString) => {
    if (!dobString) return { age: '', ageUnit: 'years' };
    const dob = new Date(dobString + 'T12:00:00');
    const today = new Date();
    if (dob > today) return { age: '', ageUnit: 'years' };

    let years = today.getFullYear() - dob.getFullYear();
    const mDiff = today.getMonth() - dob.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) years--;

    if (years >= 1) return { age: String(years), ageUnit: 'years' };

    // Under 1 year → express in whole months
    let months = (today.getFullYear() - dob.getFullYear()) * 12
        + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) months--;
    return { age: String(Math.max(0, months)), ageUnit: 'months' };
};

export default function Step2Pets({ speciesList = [], breedsList = [], genderOptions = [] }) {
    const { formData, addPet, removePet, updatePet } = useBookingStore();
    const { pets } = formData;
    const initialized = useRef(false);
    const [expandedDetails, setExpandedDetails] = useState({});
    const [tooltipIndex, setTooltipIndex] = useState(null);

    // Close breed scan tooltip when tapping outside (mobile)
    React.useEffect(() => {
        if (tooltipIndex === null) return;
        const close = () => setTooltipIndex(null);
        document.addEventListener('touchstart', close, { passive: true });
        return () => document.removeEventListener('touchstart', close);
    }, [tooltipIndex]);

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
                is_dob_estimated: false,
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
            let breedDefaultImageUrl = null;

            if (selectedBreed?.default_image_path) {
                breedDefaultImageUrl = getPublicUrl(STORAGE_BUCKETS.AVATARS, selectedBreed.default_image_path);
            }

            updatePet(index, {
                [field]: parseInt(value) || '',
                breedName: selectedBreed ? selectedBreed.name : '',
                breedDefaultImageUrl: breedDefaultImageUrl
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

    // Path A handler — typing Age or switching Unit → calculates DOB, marks estimated
    // No useEffect involved: direct onChange → single updatePet call → no loop possible.
    const handleAgeOrUnitChange = (index, field, value, pet) => {
        const newAge = field === 'age' ? value : (pet.age || '');
        const newUnit = field === 'ageUnit' ? value : (pet.ageUnit || 'years');
        const dob = calculateDobFromAge(newAge, newUnit);
        updatePet(index, {
            [field]: value,
            date_of_birth: dob,
            is_dob_estimated: !!dob,
        });
    };

    // Path B handler — picking a real DOB → calculates exact Age, clears estimated flag
    const handleDobChange = (index, dateStr) => {
        const { age, ageUnit } = calculateAgeFromDob(dateStr);
        updatePet(index, {
            date_of_birth: dateStr,
            age,
            ageUnit,
            is_dob_estimated: false,
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
        const speciesBreeds = breedsList.filter(b => b.species_id === parseInt(speciesId));
        const mixedBreed = speciesBreeds.find(b => b.name === 'Mixed Breed');
        const sorted = speciesBreeds
            .filter(b => b.name !== 'Mixed Breed')
            .map(b => ({ value: b.id, label: b.name }));
        if (mixedBreed) {
            sorted.push({ value: mixedBreed.id, label: 'Other / Unknown' });
        }
        return sorted;
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
                            <div className="flex items-center gap-2">
                                {/* Pawpaths Breed Scan — glassmorphism button with breathing pulse + tooltip */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => setTooltipIndex(index)}
                                    onMouseLeave={() => setTooltipIndex(null)}
                                >
                                    <motion.button
                                        type="button"
                                        onClick={() => {
                                            // Mobile: tap toggles tooltip; desktop: opens scanner directly
                                            if (window.matchMedia('(hover: none)').matches) {
                                                setTooltipIndex(prev => prev === index ? null : index);
                                            } else {
                                                window.open('/tools/pet-breed-scanner', '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                        animate={{ scale: [1, 1.03, 1] }}
                                        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
                                        whileHover={{ scale: 1.06 }}
                                        whileTap={{ scale: 0.96 }}
                                        aria-describedby={`breed-scan-tip-${index}`}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                                                   backdrop-blur-md bg-white/20 border border-[#FF6400]/30
                                                   text-[#FF6400] text-xs font-semibold tracking-wide
                                                   shadow-[0_4px_16px_rgba(255,100,0,0.12)]
                                                   hover:bg-[#FF6400]/10 hover:border-[#FF6400]/60
                                                   hover:shadow-[0_4px_20px_rgba(255,100,0,0.28)]
                                                   transition-colors duration-200
                                                   min-h-[44px] sm:min-h-[36px] cursor-pointer"
                                    >
                                        <Image src="/ppicon.svg" alt="" width={16} height={16} className="w-4 h-4 shrink-0" />
                                        <span className="hidden sm:inline whitespace-nowrap">Pawpaths Breed Scan</span>
                                    </motion.button>

                                    {/* Tooltip — AnimatePresence handles mount/unmount animation */}
                                    <AnimatePresence>
                                        {tooltipIndex === index && (
                                            <motion.div
                                                id={`breed-scan-tip-${index}`}
                                                role="tooltip"
                                                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.94 }}
                                                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                                className="absolute right-0 top-full mt-3 z-50 w-72 pointer-events-none"
                                            >
                                                {/* Caret */}
                                                <div className="absolute -top-[7px] right-5 w-3.5 h-3.5 rotate-45
                                                                bg-gray-950 border-t border-l border-white/10
                                                                rounded-tl-sm" />
                                                {/* Card */}
                                                <div className="rounded-2xl overflow-hidden
                                                                backdrop-blur-xl bg-gray-950/95
                                                                border border-white/10
                                                                shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                                                    {/* Orange gradient accent bar */}
                                                    <div className="h-[2px] bg-gradient-to-r from-[#FF6400] via-[#FFB347] to-transparent" />
                                                    <div className="p-4 space-y-2">
                                                        <p className="text-[10px] font-bold text-[#FF6400] uppercase tracking-widest">
                                                            AI Breed Detection
                                                        </p>
                                                        <p className="text-sm font-semibold text-white leading-snug">
                                                            Not 100% sure of the breed?
                                                        </p>
                                                        <p className="text-xs text-gray-400 leading-relaxed">
                                                            Upload a photo and let Pawpaths AI detect the exact breed for accurate flight compliance documentation.
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Remove Pet — only visible when multiple pets */}
                                {pets.length > 1 && (
                                    <motion.button
                                        onClick={() => removePet(index)}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                        variants={{
                                            rest: { scale: 1 },
                                            hover: { scale: 1.12 },
                                            tap: { scale: 0.88 },
                                        }}
                                        className="text-brand-text-02/40 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl
                                                   hover:text-error hover:bg-error/10 hover:shadow-[0_0_16px_rgba(239,68,68,0.2)]
                                                   active:text-error active:bg-error/10
                                                   transition-colors duration-150"
                                        title="Remove Pet"
                                    >
                                        <motion.span
                                            variants={{
                                                rest: { rotate: 0, scale: 1 },
                                                hover: { rotate: -15, scale: 1 },
                                                tap: { rotate: -25, scale: 0.88 },
                                            }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                        >
                                            <Trash2 size={20} />
                                        </motion.span>
                                    </motion.button>
                                )}
                            </div>
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

                            {/* Row 3: Age | Unit | DOB | Weight — single balanced row */}
                            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input
                                    id={`pet-${index}-age`}
                                    label="Age"
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={pet.age || ''}
                                    onChange={(e) => handleAgeOrUnitChange(index, 'age', e.target.value, pet)}
                                    className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                />
                                <Select
                                    id={`pet-${index}-ageUnit`}
                                    label="Unit"
                                    value={pet.ageUnit || 'years'}
                                    onChange={(e) => handleAgeOrUnitChange(index, 'ageUnit', e.target.value, pet)}
                                    options={AGE_UNITS}
                                    className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                />
                                <Input
                                    id={`pet-${index}-dob`}
                                    label="Date of Birth"
                                    type="date"
                                    value={pet.date_of_birth || ''}
                                    onChange={(e) => handleDobChange(index, e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                />
                                <Input
                                    id={`pet-${index}-weight`}
                                    label="Weight (kg)"
                                    type="number"
                                    min="0.1"
                                    max="150"
                                    step="0.1"
                                    value={pet.weight || ''}
                                    onChange={(e) => handlePetChange(index, 'weight', e.target.value)}
                                    placeholder="e.g. 25"
                                    className="bg-white/50 border-brand-text-02/20/50 focus:bg-white transition-all duration-300"
                                />
                            </div>

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
