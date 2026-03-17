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
                    travelingWithPet: false,
                },

                // Step 2: Pets
                pets: [], // Array of pet objects

                // Step 3: Services
                services: [],
                servicesData: [], // Store full service objects for display/calc

                // Step 4: Documents (per-pet)
                petDocuments: {}, // { [petIndex]: { photo: File | null, medicalDocs: File | null } }
                // Files are stored separately to avoid being persisted/serialized
                petFiles: {}, // { [petIndex]: { photo: File | null, medicalDocs: File | null } }
                // Legacy flat document fields (kept for backward compat)
                documents: {
                    passport: null,
                    vaccination: null,
                    rabies: null
                },
                contactInfo: {
                    fullName: '',
                    email: '',
                    phone: '',
                    whatsapp: '',
                    whatsappSameAsPhone: true,
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        postalCode: '',
                    },
                }
            },

            // Actions to update form data
            updatePetFiles: (petIndex, files) =>
                set((state) => ({
                    formData: {
                        ...state.formData,
                        petFiles: {
                            ...state.formData.petFiles,
                            [petIndex]: {
                                ...(state.formData.petFiles?.[petIndex] || {}),
                                ...files
                            }
                        }
                    }
                })),

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
                        transportMode: 'manifest_cargo',
                        travelingWithPet: false,
                    },
                    pets: [],
                    services: [],
                    servicesData: [],
                    petDocuments: {},
                    petFiles: {},
                    documents: {
                        passport: null,
                        vaccination: null,
                        rabies: null
                    },
                    contactInfo: {
                        fullName: '',
                        email: '',
                        phone: '',
                        whatsapp: '',
                        whatsappSameAsPhone: true,
                        address: {
                            street: '',
                            city: '',
                            state: '',
                            country: '',
                            postalCode: '',
                        },
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
            // Exclude petFiles from persistence as File objects cannot be serialized
            partialize: (state) => {
                const { petFiles, ...restFormData } = state.formData;
                return { ...state, formData: restFormData };
            },
        }
    )
);

export default useBookingStore;
