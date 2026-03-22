'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PetDrawer from '@/components/admin/PetDrawer';
import PetDetailsForm from '@/components/admin/PetDetailsForm';
import DeletePetModal from '@/components/admin/DeletePetModal';
import { upsertAdminPet, deleteAdminPet } from '@/lib/actions/admin-pet-actions';
import { getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage';

/**
 * Client component that owns the Pet Profiles card + drawer state.
 *
 * Props:
 *   initialPets   — pet objects from getAdminBookingDetails (already mapped)
 *   bookingUUID   — booking.id (UUID)
 *   speciesList   — [{ id, name }]
 *   breedsList    — [{ id, name, species_id }]
 *   genderOptions — [{ value, label }]
 */
export default function PetProfilesSection({
    initialPets = [],
    bookingUUID,
    speciesList = [],
    breedsList = [],
    genderOptions = [],
}) {
    // Local pets state — starts from server data, updated optimistically after save
    const [pets, setPets] = useState(initialPets);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingPet, setEditingPet] = useState(null); // null = add mode
    const [isSaving, setIsSaving] = useState(false);

    // Delete flow state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingPet, setDeletingPet] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync pets state when DocumentStatusSection saves any pet field via onBlur
    // so the edit drawer always loads the latest values
    React.useEffect(() => {
        const handler = (e) => {
            const { petId, microchip_id, passport_number, medicalAlerts, specialRequirements } = e.detail || {};
            if (!petId) return;
            setPets(prev => prev.map(p => p.id !== petId ? p : {
                ...p,
                microchip_id: microchip_id ?? p.microchip_id,
                passport_number: passport_number ?? p.passport_number,
                medicalAlerts: medicalAlerts ?? p.medicalAlerts,
                medical_alerts: medicalAlerts ?? p.medical_alerts,
                specialRequirements: specialRequirements ?? p.specialRequirements,
            }));
            // If the drawer is open for this pet, update editingPet too
            setEditingPet(prev => prev?.id === petId ? {
                ...prev,
                microchip_id: microchip_id ?? prev.microchip_id,
                passport_number: passport_number ?? prev.passport_number,
                medicalAlerts: medicalAlerts ?? prev.medicalAlerts,
                medical_alerts: medicalAlerts ?? prev.medical_alerts,
                specialRequirements: specialRequirements ?? prev.specialRequirements,
            } : prev);
        };
        window.addEventListener('pawpaths:pet-updated', handler);
        return () => window.removeEventListener('pawpaths:pet-updated', handler);
    }, []);

    const openAdd = () => {
        setEditingPet(null);
        setDrawerOpen(true);
    };

    const openEdit = (pet) => {
        setEditingPet(pet);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        if (isSaving) return;
        setDrawerOpen(false);
        setEditingPet(null);
    };

    const openDelete = (pet) => {
        setDeletingPet(pet);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (isDeleting) return;
        setDeleteModalOpen(false);
        setDeletingPet(null);
    };

    const handleDelete = async (reason) => {
        if (!deletingPet) return;
        setIsDeleting(true);
        try {
            const result = await deleteAdminPet(bookingUUID, deletingPet.id, reason);
            if (result.success) {
                toast.success(`${deletingPet.name} removed from relocation`);
                setPets(prev => prev.filter(p => p.id !== deletingPet.id));
                setDeleteModalOpen(false);
                setDeletingPet(null);
            } else {
                toast.error(result.message || 'Failed to remove pet');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async (formData) => {
        setIsSaving(true);
        try {
            const result = await upsertAdminPet(
                bookingUUID,
                formData,
                editingPet?.id || null
            );

            if (result.success) {
                toast.success(editingPet ? 'Pet profile updated' : 'Pet added to booking');

                // Resolve display names from reference lists (used in both add and edit)
                const speciesName = speciesList.find(s => s.id === parseInt(formData.species_id))?.name;
                const breedName = breedsList.find(b => b.id === parseInt(formData.breed_id))?.name;
                const medAlertsArr = formData.medical_alerts?.trim()
                    ? [formData.medical_alerts.trim()]
                    : [];

                if (editingPet) {
                    // Optimistic update — reflect changes immediately in the pet card
                    setPets(prev => prev.map(p => p.id !== editingPet.id ? p : {
                        ...p,
                        name: formData.name || p.name,
                        species_id: formData.species_id ? parseInt(formData.species_id) : p.species_id,
                        breed_id: formData.breed_id ? parseInt(formData.breed_id) : p.breed_id,
                        gender: formData.gender || p.gender,
                        age: formData.age !== '' ? formData.age : p.age,
                        ageUnit: formData.ageUnit || p.ageUnit,
                        weight: formData.weight !== '' ? formData.weight : p.weight,
                        microchip_id: formData.microchip_id?.trim() || null,
                        passport_number: formData.passport_number?.trim() || null,
                        medical_alerts: medAlertsArr,
                        medicalAlerts: medAlertsArr,
                        specialRequirements: formData.specialRequirements || '',
                        type: speciesName || p.type,
                        breed: breedName || p.breed,
                    }));

                    // Notify DocumentStatusSection to instantly sync all editable fields
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('pawpaths:pet-updated', {
                            detail: {
                                petId: editingPet.id,
                                microchip_id: formData.microchip_id?.trim() || '',
                                passport_number: formData.passport_number?.trim() || '',
                                medicalAlerts: medAlertsArr,
                                specialRequirements: formData.specialRequirements || '',
                            },
                        }));
                    }
                } else {
                    // Add mode — append new pet card immediately using the returned id
                    setPets(prev => [...prev, {
                        id: result.petId,
                        name: formData.name || '',
                        species_id: formData.species_id ? parseInt(formData.species_id) : null,
                        breed_id: formData.breed_id ? parseInt(formData.breed_id) : null,
                        gender: formData.gender || null,
                        age: formData.age || '',
                        ageUnit: formData.ageUnit || 'years',
                        weight: formData.weight || '',
                        microchip_id: formData.microchip_id?.trim() || null,
                        passport_number: formData.passport_number?.trim() || null,
                        medical_alerts: medAlertsArr,
                        medicalAlerts: medAlertsArr,
                        specialRequirements: formData.specialRequirements || '',
                        type: speciesName || '',
                        breed: breedName || '',
                        photoUrl: null,
                        date_of_birth: formData.date_of_birth || null,
                    }]);
                }

                setDrawerOpen(false);
                setEditingPet(null);
            } else {
                toast.error(result.message || 'Failed to save pet');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const drawerTitle = editingPet
        ? `Edit — ${editingPet.name || 'Pet'}`
        : 'Add New Pet';

    return (
        <>
            <div className="bg-brand-text-03/5 rounded-2xl shadow-sm border-[0.5px] border-brand-text-03/20 p-6 flex flex-col h-full">
                {/* Section Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-text-03/10 text-brand-text-03 rounded-xl border border-brand-text-03/20">
                            <span className="text-xl">🐾</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-brand-text-03">Pet Profiles</h2>
                            <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">
                                {pets.length} Pet{pets.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openAdd}
                            title="Add pet"
                            className="p-2 text-brand-text-02/40 hover:text-brand-color-01 hover:bg-brand-text-02/5 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Pet Cards */}
                <div className="space-y-4 flex-grow overflow-y-auto max-h-[600px] pr-2">
                    {pets.map((pet, idx) => (
                        <div
                            key={pet.id || idx}
                            className="p-4 rounded-xl border border-brand-text-03/20 bg-white/60 hover:border-brand-text-03/40 hover:bg-white/80 transition-all group"
                        >
                            {/* Row 1: Photo + Core Info */}
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-lg bg-brand-text-03/10 relative overflow-hidden flex-shrink-0">
                                    {(() => {
                                        const breedDefault = breedsList.find(b => b.id === pet.breed_id)?.default_image_path;
                                        const src = pet.photoUrl || (breedDefault ? getPublicUrl(STORAGE_BUCKETS.AVATARS, breedDefault) : null);
                                        return src ? (
                                            <Image
                                                src={src}
                                                alt={pet.name}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                                        );
                                    })()}
                                </div>
                                <div className="flex-grow flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-900">{pet.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            {/* Edit button */}
                                            <button
                                                onClick={() => openEdit(pet)}
                                                title={`Edit ${pet.name}`}
                                                className="p-1.5 text-gray-400 hover:text-brand-color-01 hover:bg-brand-color-02/20 rounded-lg transition-all duration-200 hover:scale-[1.2]"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            {/* Delete button with guardrail tooltip when only 1 pet */}
                                            <div className="relative group/del">
                                                <button
                                                    onClick={() => pets.length > 1 && openDelete(pet)}
                                                    disabled={pets.length === 1}
                                                    title={pets.length > 1 ? `Remove ${pet.name}` : undefined}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-[1.2] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent disabled:hover:scale-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                {pets.length === 1 && (
                                                    <div className="absolute top-full right-0 mt-1.5 w-56 text-[10px] text-white bg-gray-800 rounded-lg px-2.5 py-2 leading-snug opacity-0 group-hover/del:opacity-100 pointer-events-none transition-opacity duration-150 z-20 shadow-lg">
                                                        <div className="absolute bottom-full right-3 border-4 border-transparent border-b-gray-800" />
                                                        A relocation must contain at least one pet. Add another pet before removing this one.
                                                    </div>
                                                )}
                                            </div>

                                            <span className="text-brand-text-02/80 text-xs font-medium bg-brand-text-03/10 px-2 py-1 rounded border border-brand-text-03/20">
                                                {pet.type} <span className="text-brand-text-02/60">({pet.breed})</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-brand-text-02 font-medium">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            pet.gender?.toLowerCase() === 'male'
                                                ? 'bg-info/10 text-info border-system-color-03'
                                                : 'bg-pink-50 text-pink-600 border-pink-100'
                                        }`}>
                                            {pet.gender || 'Unknown'}
                                        </span>
                                        <span className="text-brand-text-02/60">|</span>
                                        <span>{pet.age} {pet.ageUnit}</span>
                                        <span className="text-brand-text-02/60">|</span>
                                        <span>{pet.weight} KG</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}

                    {pets.length === 0 && (
                        <div className="text-center py-8 text-brand-text-02/60 italic">No pets added to manifest.</div>
                    )}
                </div>
            </div>

            {/* Drawer */}
            <PetDrawer isOpen={drawerOpen} onClose={closeDrawer} title={drawerTitle}>
                <PetDetailsForm
                    key={editingPet?.id || 'new'}
                    initialData={editingPet || {}}
                    speciesList={speciesList}
                    breedsList={breedsList}
                    genderOptions={genderOptions}
                    onSubmit={handleSave}
                    onCancel={closeDrawer}
                    isSaving={isSaving}
                />
            </PetDrawer>

            {/* Delete confirmation modal */}
            <DeletePetModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                petName={deletingPet?.name}
                isDeleting={isDeleting}
            />
        </>
    );
}
