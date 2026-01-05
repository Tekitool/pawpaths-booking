'use client';

import React from 'react';
import { PawPrint, Plus, Ruler, Weight, Calendar } from 'lucide-react';

export default function PetManifest({ pets, bookingId }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-900 flex items-center gap-2">
                    <PawPrint size={20} className="text-accent" />
                    Pet Manifest
                </h3>
                <button className="text-xs font-bold text-info bg-info/10 hover:bg-info/10 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
                    <Plus size={14} /> Add Pet
                </button>
            </div>

            <div className="space-y-4">
                {pets && pets.length > 0 ? (
                    pets.map((bookingPet) => {
                        const pet = bookingPet.pet;
                        return (
                            <div key={pet.id} className="border border-brand-text-02/20 rounded-xl p-4 hover:border-accent/50 hover:bg-accent/15/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-gray-900">{pet.name}</h4>
                                        <p className="text-xs text-brand-text-02/80">{pet.species?.name} • {pet.breed?.name}</p>
                                    </div>
                                    <button className="text-xs text-brand-text-02/60 hover:text-info opacity-0 group-hover:opacity-100 transition-opacity">
                                        Edit
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    <div className="bg-brand-text-02/5 rounded-lg p-2 text-center">
                                        <Weight size={14} className="mx-auto text-brand-text-02/60 mb-1" />
                                        <span className="text-xs font-semibold text-brand-text-02">{pet.weight_kg} kg</span>
                                    </div>
                                    <div className="bg-brand-text-02/5 rounded-lg p-2 text-center">
                                        <Calendar size={14} className="mx-auto text-brand-text-02/60 mb-1" />
                                        <span className="text-xs font-semibold text-brand-text-02">{pet.age_years} yrs</span>
                                    </div>
                                    <div className="bg-brand-text-02/5 rounded-lg p-2 text-center">
                                        <Ruler size={14} className="mx-auto text-brand-text-02/60 mb-1" />
                                        <span className="text-xs font-semibold text-brand-text-02">Dims?</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-brand-text-02/60 text-sm bg-brand-text-02/5 rounded-xl border border-dashed border-brand-text-02/20">
                        No pets linked to this booking.
                    </div>
                )}
            </div>
        </div>
    );
}
