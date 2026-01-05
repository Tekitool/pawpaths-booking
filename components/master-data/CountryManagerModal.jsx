'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Globe, Trash2, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCountries, upsertCountry, deleteRecord } from '@/lib/actions/manage-master-data';

// Helper to convert ISO code to Flag Emoji
const getFlagEmoji = (isoCode) => {
    if (!isoCode) return '🏳️';
    return isoCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

import SecurityModal from '@/components/ui/SecurityModal';

export default function CountryManagerModal({ isOpen, onClose }) {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        iso_code: '',
        iso_code_3: '',
        name: '',
        currency_code: '',
        phone_code: '',
        timezone: '',
        requires_import_permit: false
    });
    const [isNew, setIsNew] = useState(true);

    // Security Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCountries = async () => {
        setLoading(true);
        const data = await getCountries();
        setCountries(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => fetchCountries(), 0);
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!formData.id || !formData.name || !formData.iso_code) {
            return toast.error("ID, Name, and ISO Code are required");
        }

        const result = await upsertCountry({ ...formData, is_new: isNew });

        if (result.success) {
            toast.success(isNew ? "Country added" : "Country updated");
            setIsEditing(false);
            fetchCountries();
        } else {
            toast.error(result.message);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteTarget({ id });
    };

    const executeDelete = async (reason) => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        const result = await deleteRecord('countries', deleteTarget.id);

        if (result.success) {
            toast.success("Deleted successfully");
            fetchCountries();
            setDeleteTarget(null);
        } else {
            toast.error(result.message);
        }
        setIsDeleting(false);
    };

    const startEdit = (country) => {
        setFormData(country);
        setIsNew(false);
        setIsEditing(true);
    };

    const startAdd = () => {
        setFormData({
            id: '',
            iso_code: '',
            iso_code_3: '',
            name: '',
            currency_code: '',
            phone_code: '',
            timezone: '',
            requires_import_permit: false
        });
        setIsNew(true);
        setIsEditing(true);
    };

    const handleTogglePermit = async (country) => {
        // Optimistic
        const updated = { ...country, requires_import_permit: !country.requires_import_permit };
        setCountries(prev => prev.map(c => c.id === country.id ? updated : c));

        const result = await upsertCountry({ ...updated, is_new: false });
        if (!result.success) {
            toast.error("Update failed");
            setCountries(prev => prev.map(c => c.id === country.id ? country : c));
        }
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.iso_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.iso_code_3?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-brand-text-02/20 flex justify-between items-center bg-white">
                        <div>
                            <h2 className="text-gray-900 flex items-center gap-3">
                                <Globe className="text-brand-color-01" /> Location Manager
                            </h2>
                            <p className="text-brand-text-02/80 text-sm mt-1">Manage global country database and regulations.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-brand-text-02/10 rounded-full transition-colors text-brand-text-02/60 hover:text-brand-text-02">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="px-8 py-4 bg-brand-text-02/5 border-b border-brand-text-02/20 flex gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-02/60" size={18} />
                            <input
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all"
                                placeholder="Search Country or ISO Code..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1"></div>
                        <button
                            onClick={startAdd}
                            className="px-4 py-2.5 bg-brand-color-01 text-white rounded-xl hover:bg-brand-color-01/90 transition-colors font-bold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <Plus size={18} /> Add Country
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Table */}
                        <div className={`flex-1 overflow-y-auto p-0 ${isEditing ? 'w-2/3 border-r border-brand-text-02/20' : 'w-full'}`}>
                            <table className="w-full">
                                <thead className="bg-brand-text-02/5/80 sticky top-0 backdrop-blur-sm z-10 border-b border-brand-text-02/20">
                                    <tr>
                                        <th className="text-left py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">Flag</th>
                                        <th className="text-left py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">Name</th>
                                        <th className="text-left py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">ISO</th>
                                        <th className="text-left py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">Phone</th>
                                        <th className="text-left py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">Timezone</th>
                                        <th className="text-center py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">Import Permit</th>
                                        <th className="text-right py-3 px-6 text-xs font-bold text-brand-text-02/80 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-12 text-brand-text-02/60">Loading countries...</td></tr>
                                    ) : filteredCountries.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-12 text-brand-text-02/60">No countries found.</td></tr>
                                    ) : filteredCountries.map(country => (
                                        <tr key={country.id} className="hover:bg-brand-text-02/5/50 transition-colors group">
                                            <td className="py-3 px-6 text-2xl">{getFlagEmoji(country.iso_code)}</td>
                                            <td className="py-3 px-6 font-bold text-gray-900">{country.name}</td>
                                            <td className="py-3 px-6 text-sm font-mono text-brand-text-02">
                                                <span className="bg-brand-text-02/10 px-1.5 py-0.5 rounded">{country.iso_code}</span>
                                                <span className="ml-1 text-brand-text-02/60">{country.iso_code_3}</span>
                                            </td>
                                            <td className="py-3 px-6 text-sm text-brand-text-02">{country.phone_code || '-'}</td>
                                            <td className="py-3 px-6 text-sm text-brand-text-02 truncate max-w-[150px]">{country.timezone || '-'}</td>
                                            <td className="py-3 px-6 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={country.requires_import_permit}
                                                        onChange={() => handleTogglePermit(country)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-brand-text-02/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-color-01/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brand-text-02/20 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-color-01"></div>
                                                </label>
                                            </td>
                                            <td className="py-3 px-6 text-right space-x-1">
                                                <button onClick={() => startEdit(country)} className="p-1.5 hover:bg-accent/15 rounded-lg text-brand-text-02/60 hover:text-accent transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(country.id)} className="p-1.5 hover:bg-error/10 rounded-lg text-brand-text-02/60 hover:text-system-color-01 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Edit Form Sidebar */}
                        {isEditing && (
                            <div className="w-1/3 border-l border-brand-text-02/20 bg-brand-text-02/5 p-6 flex flex-col shadow-xl z-20 animate-in slide-in-from-right-10">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-brand-text-02">{isNew ? 'Add Country' : 'Edit Country'}</h3>
                                    <button onClick={() => setIsEditing(false)} className="text-brand-text-02/60 hover:text-brand-text-02"><X size={20} /></button>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">Country Name</label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. United Arab Emirates"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">Numeric ID</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all"
                                                value={formData.id}
                                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                                placeholder="e.g. 784"
                                                disabled={!isNew} // ID is PK, usually immutable
                                                type="number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">Phone Code</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all"
                                                value={formData.phone_code || ''}
                                                onChange={e => setFormData({ ...formData, phone_code: e.target.value })}
                                                placeholder="e.g. +971"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">ISO (2)</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all uppercase"
                                                value={formData.iso_code}
                                                onChange={e => setFormData({ ...formData, iso_code: e.target.value.toUpperCase() })}
                                                placeholder="AE"
                                                maxLength={2}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">ISO (3)</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all uppercase"
                                                value={formData.iso_code_3 || ''}
                                                onChange={e => setFormData({ ...formData, iso_code_3: e.target.value.toUpperCase() })}
                                                placeholder="ARE"
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">Timezone</label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all"
                                            value={formData.timezone || ''}
                                            onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                            placeholder="e.g. Asia/Dubai"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-brand-text-02/80 uppercase mb-1">Currency Code</label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all uppercase"
                                            value={formData.currency_code || ''}
                                            onChange={e => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. AED"
                                            maxLength={3}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-brand-text-02/20">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.requires_import_permit}
                                                onChange={e => setFormData({ ...formData, requires_import_permit: e.target.checked })}
                                                className="w-5 h-5 rounded text-brand-color-01 focus:ring-brand-color-01 border-brand-text-02/20"
                                            />
                                            <span className="font-medium text-brand-text-02">Requires Import Permit</span>
                                        </label>
                                        <p className="text-xs text-brand-text-02/80 mt-1 ml-8">Does this country require an import permit for pet travel?</p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-auto">
                                    <button
                                        onClick={handleSave}
                                        className="w-full py-3 bg-brand-color-01 text-white rounded-xl hover:bg-brand-color-01/90 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Save size={18} /> {isNew ? 'Create Country' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SecurityModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title="Delete Country"
                actionType="danger"
                isLoading={isDeleting}
                zIndex="z-[110]"
            />
        </>
    );
}
