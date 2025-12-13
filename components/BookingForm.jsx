'use client';

import React, { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { countries } from '@/lib/constants/countries';
import PetDetailsSection from './PetDetailsSection';
import SuccessModal from './SuccessModal';
import LoadingSpinner from './LoadingSpinner';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        customerInfo: { fullName: '', email: '', phone: '' },
        travelDetails: {
            numberOfPets: 1,
            originCountry: '',
            originAirport: '',
            destinationCountry: '',
            destinationAirport: '',
            travelDate: '',
            clientTravelingWithPet: '',
        },
        pets: [{
            petNumber: 1,
            type: '',
            breed: '',
            name: '',
            age: '',
            weight: '',
            specialRequirements: ''
        }]
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const handleCustomerChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            customerInfo: { ...prev.customerInfo, [field]: value }
        }));
        // Clear error
        if (errors[`customer_${field}`]) {
            setErrors(prev => ({ ...prev, [`customer_${field}`]: '' }));
        }
    };

    const handleTravelChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            travelDetails: { ...prev.travelDetails, [field]: value }
        }));
        if (errors[`travel_${field}`]) {
            setErrors(prev => ({ ...prev, [`travel_${field}`]: '' }));
        }
    };

    const handlePetChange = (index, field, value) => {
        const newPets = [...formData.pets];
        newPets[index] = { ...newPets[index], [field]: value };
        setFormData(prev => ({ ...prev, pets: newPets }));

        // Clear error
        if (errors[`pet_${index}_${field}`]) {
            setErrors(prev => ({ ...prev, [`pet_${index}_${field}`]: '' }));
        }
    };

    const addPet = () => {
        if (formData.pets.length >= 10) return;
        setFormData(prev => ({
            ...prev,
            travelDetails: { ...prev.travelDetails, numberOfPets: prev.pets.length + 1 },
            pets: [...prev.pets, {
                petNumber: prev.pets.length + 1,
                type: '',
                breed: '',
                name: '',
                age: '',
                weight: '',
                specialRequirements: ''
            }]
        }));
    };

    const removePet = (index) => {
        if (formData.pets.length <= 1) return;
        const newPets = formData.pets.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            travelDetails: { ...prev.travelDetails, numberOfPets: newPets.length },
            pets: newPets
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Customer Info
        if (!formData.customerInfo.fullName.trim()) newErrors.customer_fullName = 'Full name is required';
        if (!formData.customerInfo.email.trim()) {
            newErrors.customer_email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.customerInfo.email)) {
            newErrors.customer_email = 'Invalid email format';
        }
        if (!formData.customerInfo.phone.trim()) newErrors.customer_phone = 'Phone number is required';

        // Travel Details
        if (!formData.travelDetails.originCountry) newErrors.travel_originCountry = 'Origin country is required';
        if (!formData.travelDetails.originAirport.trim()) newErrors.travel_originAirport = 'Origin airport is required';
        if (!formData.travelDetails.destinationCountry) newErrors.travel_destinationCountry = 'Destination country is required';
        if (!formData.travelDetails.destinationAirport.trim()) newErrors.travel_destinationAirport = 'Destination airport is required';
        if (!formData.travelDetails.travelDate) {
            newErrors.travel_travelDate = 'Travel date is required';
        } else if (new Date(formData.travelDetails.travelDate) < new Date()) {
            newErrors.travel_travelDate = 'Travel date must be in the future';
        }
        if (!formData.travelDetails.clientTravelingWithPet) {
            newErrors.travel_clientTravelingWithPet = 'Please select yes or no';
        }

        // Pets
        formData.pets.forEach((pet, index) => {
            if (!pet.type) newErrors[`pet_${index}_type`] = 'Required';
            if (!pet.breed) newErrors[`pet_${index}_breed`] = 'Required';
            if (!pet.name.trim()) newErrors[`pet_${index}_name`] = 'Required';
            if (!pet.age || pet.age <= 0) newErrors[`pet_${index}_age`] = 'Invalid age';
            if (!pet.weight || pet.weight <= 0) newErrors[`pet_${index}_weight`] = 'Invalid weight';
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            // Scroll to top or first error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccessData({
                ...data,
                ...data.booking // Flatten booking details into the root
            });
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError(error.message || 'Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSuccessData(null);
        setFormData({
            customerInfo: { fullName: '', email: '', phone: '' },
            travelDetails: {
                numberOfPets: 1,
                originCountry: '',
                originAirport: '',
                destinationCountry: '',
                destinationAirport: '',
                travelDate: '',
                clientTravelingWithPet: '',
            },
            pets: [{
                petNumber: 1,
                type: '',
                breed: '',
                name: '',
                age: '',
                weight: '',
                specialRequirements: ''
            }]
        });
        setErrors({});
    };

    return (
        <div className="max-w-4xl mx-auto">
            {successData && (
                <SuccessModal
                    bookingData={successData}
                    onClose={() => setSuccessData(null)}
                    onReset={resetForm}
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-pawpaths-brown mb-6 border-b pb-2">Customer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={formData.customerInfo.fullName}
                                onChange={(e) => handleCustomerChange('fullName', e.target.value)}
                                className={`w-full bg-[#fff2b1] border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.customer_fullName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="John Doe"
                            />
                            {errors.customer_fullName && <p className="text-red-500 text-xs mt-1">{errors.customer_fullName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                value={formData.customerInfo.email}
                                onChange={(e) => handleCustomerChange('email', e.target.value)}
                                className={`w-full bg-[#fff2b1] border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.customer_email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="john@example.com"
                            />
                            {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.customerInfo.phone}
                                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                                className={`w-full bg-[#fff2b1] border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.customer_phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="+971 50 123 4567"
                            />
                            {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Travel Details */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-pawpaths-brown mb-6 border-b pb-2">Travel Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country *</label>
                            <select
                                value={formData.travelDetails.originCountry}
                                onChange={(e) => handleTravelChange('originCountry', e.target.value)}
                                className={`w-full bg-[#fff2b1] border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.travel_originCountry ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select Country</option>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.travel_originCountry && <p className="text-red-500 text-xs mt-1">{errors.travel_originCountry}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Origin Airport *</label>
                            <input
                                type="text"
                                value={formData.travelDetails.originAirport}
                                onChange={(e) => handleTravelChange('originAirport', e.target.value)}
                                className={`w-full bg-pawpaths-cream border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.travel_originAirport ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="e.g. DXB"
                            />
                            {errors.travel_originAirport && <p className="text-red-500 text-xs mt-1">{errors.travel_originAirport}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country *</label>
                            <select
                                value={formData.travelDetails.destinationCountry}
                                onChange={(e) => handleTravelChange('destinationCountry', e.target.value)}
                                className={`w-full bg-pawpaths-cream border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.travel_destinationCountry ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select Country</option>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.travel_destinationCountry && <p className="text-red-500 text-xs mt-1">{errors.travel_destinationCountry}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Airport *</label>
                            <input
                                type="text"
                                value={formData.travelDetails.destinationAirport}
                                onChange={(e) => handleTravelChange('destinationAirport', e.target.value)}
                                className={`w-full bg-pawpaths-cream border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.travel_destinationAirport ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="e.g. LHR"
                            />
                            {errors.travel_destinationAirport && <p className="text-red-500 text-xs mt-1">{errors.travel_destinationAirport}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date *</label>
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.travelDetails.travelDate}
                                onChange={(e) => handleTravelChange('travelDate', e.target.value)}
                                className={`w-full bg-pawpaths-cream border rounded-lg px-4 py-3 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none ${errors.travel_travelDate ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.travel_travelDate && <p className="text-red-500 text-xs mt-1">{errors.travel_travelDate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Traveling with your pet? *</label>
                            <div className={`w-full bg-[#fff2b1] border rounded-lg px-4 py-3 flex gap-6 ${errors.travel_clientTravelingWithPet ? 'border-red-500' : 'border-gray-300'}`}>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="clientTravelingWithPet"
                                        value="yes"
                                        checked={formData.travelDetails.clientTravelingWithPet === 'yes'}
                                        onChange={(e) => handleTravelChange('clientTravelingWithPet', e.target.value)}
                                        className="w-4 h-4 text-pawpaths-brown focus:ring-pawpaths-brown"
                                    />
                                    <span className="text-gray-700">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="clientTravelingWithPet"
                                        value="no"
                                        checked={formData.travelDetails.clientTravelingWithPet === 'no'}
                                        onChange={(e) => handleTravelChange('clientTravelingWithPet', e.target.value)}
                                        className="w-4 h-4 text-pawpaths-brown focus:ring-pawpaths-brown"
                                    />
                                    <span className="text-gray-700">No</span>
                                </label>
                            </div>
                            {errors.travel_clientTravelingWithPet && <p className="text-red-500 text-xs mt-1">{errors.travel_clientTravelingWithPet}</p>}
                        </div>
                    </div>
                </div>

                {/* Pet Details */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-pawpaths-brown mb-2 px-1">Pet Details</h2>
                    {formData.pets.map((pet, index) => (
                        <PetDetailsSection
                            key={index}
                            petNumber={index}
                            petData={pet}
                            onChange={handlePetChange}
                            onRemove={removePet}
                            errors={{
                                type: errors[`pet_${index}_type`],
                                breed: errors[`pet_${index}_breed`],
                                name: errors[`pet_${index}_name`],
                                age: errors[`pet_${index}_age`],
                                weight: errors[`pet_${index}_weight`],
                            }}
                        />
                    ))}

                    {formData.pets.length < 10 && (
                        <button
                            type="button"
                            onClick={addPet}
                            className="flex items-center gap-2 text-pawpaths-brown font-semibold hover:text-[#3d2815] transition-colors px-1"
                        >
                            <Plus size={20} />
                            Add Another Pet
                        </button>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    {submitError && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">
                            {submitError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pawpaths-brown hover:bg-[#3d2815] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Submit Booking Request</span>
                                <Send size={20} />
                            </>
                        )}
                    </button>
                    <p className="text-center text-gray-500 text-sm mt-4">
                        By submitting this form, you agree to our <a href="#" className="text-pawpaths-brown hover:underline">terms and conditions</a> and <a href="#" className="text-pawpaths-brown hover:underline">privacy policy</a>.
                    </p>
                </div>
            </form>
        </div>
    );
}
