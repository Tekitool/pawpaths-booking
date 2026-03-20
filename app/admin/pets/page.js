'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPets } from '@/lib/actions/pet-actions';
import PageShell from '@/components/ui/PageShell';
import PetTable from '@/components/admin/PetTable';
import Pagination from '@/components/ui/Pagination';
import { Plus } from 'lucide-react';
import SecurityModal from '@/components/ui/SecurityModal';

const PAGE_SIZE = 15;

function TableSkeleton() {
    return <div className="w-full h-96 bg-white/40 rounded-xl animate-pulse" />;
}

export default function PetsPage() {
    const searchParams = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const query = searchParams.get('query') || '';

    const [pets, setPets] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchPets = async () => {
            setLoading(true);
            try {
                const result = await getPets({ page, pageSize: PAGE_SIZE, query });
                setPets(result.data || []);
                setTotal(result.total || 0);
                setTotalPages(result.totalPages || 0);
            } catch (e) {
                console.error('Error fetching pets:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, [page, query]);

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
            const result = await getPets({ page, pageSize: PAGE_SIZE, query });
            setPets(result.data || []);
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 0);
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
                <>
                    <PetTable pets={pets} onDelete={handleDeleteClick} />
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        pageSize={PAGE_SIZE}
                    />
                </>
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
