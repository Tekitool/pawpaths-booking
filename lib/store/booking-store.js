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
                    travelingWithPet: false,
                },

                // Step 2: Pets
                pets: [], // Array of pet objects

                // Step 3: Services
                services: [],

                // Step 4: Documents
                documents: {
                    passport: null,
                    vaccination: null,
                    rabies: null
                },

                // Step 5: Contact
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

            updateServices: (services) =>
                set((state) => ({
                    formData: { ...state.formData, services }
                })),

            updateContactInfo: (info) =>
                set((state) => ({
                    formData: { ...state.formData, contactInfo: { ...state.formData.contactInfo, ...info } }
                })),

            resetForm: () => set({ currentStep: 1, formData: { travelDetails: {}, pets: [], services: [], documents: { passport: null, vaccination: null, rabies: null }, contactInfo: {} } }),
        }),
        {
            name: 'pawpaths-booking-storage', // unique name for localStorage
        }
    )
);

export default useBookingStore;
