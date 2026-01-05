'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { getPets } from '@/lib/actions/pet-actions';
import PageShell from '@/components/ui/PageShell';
import PetTable from '@/components/admin/PetTable';
import { Plus } from 'lucide-react';
import SecurityModal from '@/components/ui/SecurityModal';

function TableSkeleton() {
    return <div className="w-full h-96 bg-white/40 rounded-xl animate-pulse" />;
}

export default function PetsPage() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const data = await getPets();
                setPets(data || []);
            } catch (e) {
                console.error('Error fetching pets:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const executeDelete = async (reason) => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await fetch(`/api/pets/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audit_reason: reason }),
            });
            // Refresh list after deletion
            const refreshed = await getPets();
            setPets(refreshed || []);
        } catch (error) {
            console.error('Error deleting pet:', error);
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <PageShell
            title="Pet Registry"
            subtitle="Database of all furry travelers"
            actions={
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent transition-colors shadow-sm font-medium text-sm">
                    <Plus size={16} /> Add Pet
                </button>
            }
        >
            {loading ? (
                <TableSkeleton />
            ) : (
                <PetTable pets={pets} onDelete={handleDeleteClick} />
            )}
            <SecurityModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={executeDelete}
                title="Confirm Deletion"
                actionType="danger"
                isLoading={isDeleting}
            />
        </PageShell>
    );
}
