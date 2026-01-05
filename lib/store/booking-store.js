import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBookingStore = create(
    persist(
        (set) => ({
            // Current Step
            currentStep: 1,
            setStep: (step) => set({ currentStep: step }),
            nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
            prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

            // Form Data
            formData: {
                // Step 1: Travel
                travelDetails: {
                    originCountry: '',
                    originAirport: '',
                    destinationCountry: '',
                    destinationAirport: '',
                    travelDate: null,
                    transportMode: 'manifest_cargo',
                },

                // Step 2: Pets
                pets: [], // Array of pet objects

                // Step 3: Services
                services: [],
                servicesData: [], // Store full service objects for display/calc

                // Step 4: Documents
                documents: {
                    passport: null,
                    vaccination: null,
                    rabies: null
                },
                contactInfo: {
                    fullName: '',
                    email: '',
                    phone: '',
                }
            },

            // Actions to update form data
            updateTravelDetails: (details) =>
                set((state) => ({
                    formData: { ...state.formData, travelDetails: { ...state.formData.travelDetails, ...details } }
                })),

            updateDocuments: (docs) =>
                set((state) => ({
                    formData: { ...state.formData, documents: { ...state.formData.documents, ...docs } }
                })),

            addPet: (pet) =>
                set((state) => ({
                    formData: { ...state.formData, pets: [...state.formData.pets, pet] }
                })),

            removePet: (index) =>
                set((state) => ({
                    formData: { ...state.formData, pets: state.formData.pets.filter((_, i) => i !== index) }
                })),

            updatePet: (index, petDetails) =>
                set((state) => {
                    const newPets = [...state.formData.pets];
                    newPets[index] = { ...newPets[index], ...petDetails };
                    return { formData: { ...state.formData, pets: newPets } };
                }),

            updateServices: (services, servicesData = []) =>
                set((state) => ({
                    formData: { ...state.formData, services, servicesData }
                })),

            updateContactInfo: (info) =>
                set((state) => ({
                    formData: { ...state.formData, contactInfo: { ...state.formData.contactInfo, ...info } }
                })),

            resetForm: () => set({
                currentStep: 1,
                formData: {
                    travelDetails: {
                        originCountry: '',
                        originAirport: '',
                        destinationCountry: '',
                        destinationAirport: '',
                        travelDate: null,
                        transportMode: 'manifest_cargo', // Default
                    },
                    pets: [],
                    services: [],
                    documents: {
                        passport: null,
                        vaccination: null,
                        rabies: null
                    },
                    contactInfo: {
                        fullName: '',
                        email: '',
                        phone: '',
                    }
                }
            }),

            // Booking Reference
            bookingReference: null,
            setBookingReference: (ref) => set({ bookingReference: ref }),

            // Generic update action
            setFormData: (updateFn) => set((state) => {
                const newFormData = typeof updateFn === 'function' ? updateFn(state.formData) : updateFn;
                return { formData: { ...state.formData, ...newFormData } };
            }),
        }),
        {
            name: 'pawpaths-booking-storage', // unique name for localStorage
        }
    )
);

export default useBookingStore;
