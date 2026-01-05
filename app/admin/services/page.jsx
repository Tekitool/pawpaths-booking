'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import ServicesTable from '@/components/admin/ServicesTable';
import { useRouter } from 'next/navigation';
import SecurityModal from '@/components/ui/SecurityModal';
import { toast } from 'sonner';
import { getCategories } from '@/lib/actions/service-actions';

export default function ServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterMandatory, setFilterMandatory] = useState('all'); // 'all', 'mandatory', 'optional'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

    const [deleteIds, setDeleteIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesResponse, categoriesData] = await Promise.all([
                fetch('/api/services'),
                getCategories()
            ]);

            const servicesData = await servicesResponse.json();
            const rawData = servicesData.data || [];
            // Deduplicate by ID to ensure unique keys
            const uniqueServices = Array.from(new Map(rawData.map(item => [item.id || item._id, item])).values());

            setServices(uniqueServices);
            setCategories(categoriesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteRequest = (ids) => {
        setDeleteIds(ids);
    };

    const executeDelete = async (reason) => {
        if (deleteIds.length === 0) return;
        setIsDeleting(true);
        try {
            // Execute deletes in parallel
            await Promise.all(deleteIds.map(id =>
                fetch(`/api/services/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audit_reason: reason })
                })
            ));

            toast.success(`Successfully deleted ${deleteIds.length} service(s)`);
            fetchData();
            setDeleteIds([]);
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete services');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setServices(prev => prev.map(s =>
            (s.id === id || s._id === id) ? { ...s, is_active: newStatus } : s
        ));

        try {
            const response = await fetch(`/api/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');
            toast.success(newStatus ? 'Service activated' : 'Service archived');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
            fetchData(); // Revert on error
        }
    };

    const handleArchive = async (ids) => {
        try {
            await Promise.all(ids.map(id =>
                fetch(`/api/services/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: false })
                })
            ));
            toast.success(`Archived ${ids.length} service(s)`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to archive services');
        }
    };

    // --- Data Transformation ---
    const filteredServices = Array.isArray(services) ? services.filter(s => {
        // Search filter
        const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.short_description || s.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = filterCategory === 'all' ? true : s.category_id === Number(filterCategory);

        // Mandatory filter
        const isMandatory = s.is_mandatory || s.isMandatory || false;
        const matchesMandatory = filterMandatory === 'all' ? true :
            filterMandatory === 'mandatory' ? isMandatory : !isMandatory;

        // Status filter
        const isActive = s.is_active !== undefined ? s.is_active : (s.status === 'active');
        const matchesStatus = filterStatus === 'all' ? true :
            filterStatus === 'active' ? isActive : !isActive;

        return matchesSearch && matchesCategory && matchesMandatory && matchesStatus;
    }) : [];

    const uniqueFilteredServices = Array.from(new Map(filteredServices.map(s => [s.id || s._id, s])).values());

    const tableData = uniqueFilteredServices.map(s => ({
        id: s.id || s._id,
        name: s.name || 'Unnamed Service',
        description: s.short_description || s.shortDescription || '',
        cost: Number(s.base_cost || s.baseCost || 0),
        price: Number(s.base_price || s.basePrice || 0),
        isMandatory: s.is_mandatory || s.isMandatory || false,
        isActive: s.is_active !== undefined ? s.is_active : (s.status === 'active'),
        category: s.category?.name || 'Uncategorized'
    }));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-gray-900">Services</h1>
                    <p className="text-sm text-brand-text-02/80 mt-1">View all available services</p>
                </div>
                <Button onClick={() => router.push('/admin/services/new')} className="bg-brand-color-03 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:bg-brand-color-03/90 text-sm">
                    <Plus size={16} className="mr-2" /> Add Service
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Search */}
                <div className="relative lg:col-span-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-02/60" size={16} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl border border-brand-text-02/20 shadow-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all text-sm"
                    />
                </div>

                {/* Filter by Category */}
                <div className="relative lg:col-span-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-brand-text-02/20 shadow-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all appearance-none cursor-pointer font-medium text-brand-text-02 text-sm"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                        <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Filter by Mandatory */}
                <div className="relative lg:col-span-2">
                    <select
                        value={filterMandatory}
                        onChange={(e) => setFilterMandatory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-brand-text-02/20 shadow-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all appearance-none cursor-pointer font-medium text-brand-text-02 text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="mandatory">Mandatory Only</option>
                        <option value="optional">Optional Only</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                        <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Filter by Status */}
                <div className="relative lg:col-span-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-brand-text-02/20 shadow-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all appearance-none cursor-pointer font-medium text-brand-text-02 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                        <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Services Table */}
            {loading ? (
                <div className="text-center py-12 text-brand-text-02/60 text-sm">Loading services...</div>
            ) : uniqueFilteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-brand-text-02/20 p-12 text-center">
                    <AlertCircle size={40} className="mx-auto mb-4 text-brand-text-02/60" />
                    <h3 className="text-brand-text-02 mb-2">No Services Found</h3>
                    <p className="text-sm text-brand-text-02/80 mb-6">
                        {(searchTerm || filterMandatory !== 'all' || filterStatus !== 'all')
                            ? 'Try adjusting your search or filter criteria'
                            : 'Get started by adding your first service'}
                    </p>
                    {!searchTerm && filterMandatory === 'all' && filterStatus === 'all' && (
                        <Button onClick={() => router.push('/admin/services/new')} className="bg-brand-color-03 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-color-03/90">
                            <Plus size={16} className="mr-2" /> Add Service
                        </Button>
                    )}
                </div>
            ) : (
                <ServicesTable
                    data={tableData}
                    onEdit={(serviceData) => {
                        // Navigate to edit page
                        const id = serviceData.id || serviceData._id;
                        router.push(`/admin/services/${id}`);
                    }}
                    onDelete={handleDeleteRequest}
                    onToggleStatus={handleToggleStatus}
                    onArchive={handleArchive}
                />
            )}

            <SecurityModal
                isOpen={deleteIds.length > 0}
                onClose={() => setDeleteIds([])}
                onConfirm={executeDelete}
                title={`Delete ${deleteIds.length} Service${deleteIds.length > 1 ? 's' : ''}?`}
                actionType="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
