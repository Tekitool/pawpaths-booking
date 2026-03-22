'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Download, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getSecureDocumentUrl, getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage';
import Image from 'next/image';

import { uploadBookingDocument, deleteBookingDocument } from '@/lib/actions/admin-booking-actions';
import { updatePetFields } from '@/lib/actions/admin-pet-actions';
import { useRef } from 'react';
import { Trash2, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import SecurityModal from '../ui/SecurityModal';

const DocumentFrame = ({ title, type, path, isPrivate, preSignedUrl, bookingId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    // Determine file type and fetch URL on mount/path change
    React.useEffect(() => {
        if (!path) return;

        const ext = path.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            setFileType('image');
        } else if (ext === 'pdf') {
            setFileType('pdf');
        } else {
            setFileType('other');
        }

        const fetchUrls = async () => {
            try {
                let pUrl = '';
                let dUrl = '';

                if (preSignedUrl) {
                    // Use server-provided signed URL
                    pUrl = preSignedUrl;
                    dUrl = preSignedUrl;
                } else if (isPrivate) {
                    // Fetch inline URL for preview
                    pUrl = await getSecureDocumentUrl(path, { download: false });
                    // Fetch download URL for button
                    dUrl = await getSecureDocumentUrl(path, { download: true });
                } else {
                    pUrl = getPublicUrl(STORAGE_BUCKETS.PHOTOS, path);
                    dUrl = pUrl;
                }

                setPreviewUrl(pUrl);
                setDownloadUrl(dUrl);
            } catch (error) {
                console.error('Error fetching URLs:', error);
            }
        };

        fetchUrls();
    }, [path, isPrivate, title, preSignedUrl]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadBookingDocument(bookingId, type, formData);
            if (!result.success) {
                toast.error(`Upload failed: ${result.message}`);
            } else {
                toast.success('Document uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const executeDelete = async (reason) => {
        setIsDeleting(true);
        try {
            const result = await deleteBookingDocument(bookingId, type, reason);
            if (!result.success) {
                toast.error(`Delete failed: ${result.message}`);
            } else {
                toast.success('Document removed successfully');
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    // State A: Uploaded
    if (path) {
        return (
            <div className="group relative flex flex-col h-40 bg-white rounded-xl border border-system-color-02/30 overflow-hidden transition-all hover:shadow-md">
                {/* Preview Area */}
                <div className="flex-grow bg-brand-text-02/5 relative flex items-center justify-center overflow-hidden">
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
                            <Loader2 className="animate-spin text-brand-color-01" size={24} />
                        </div>
                    )}

                    {fileType === 'image' && previewUrl && (
                        <div className="relative w-full h-full">
                            <Image
                                src={previewUrl}
                                alt={title}
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>
                    )}

                    {fileType === 'pdf' && previewUrl && (
                        <div className="relative w-full h-full bg-white">
                            <object
                                data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                type="application/pdf"
                                className="w-full h-full"
                            >
                                {/* Fallback if PDF cannot be displayed inline */}
                                <div className="flex items-center justify-center h-full text-brand-text-02/40">
                                    <FileText size={40} />
                                </div>
                            </object>
                            {/* Transparent overlay to capture clicks/hovers and prevent interaction */}
                            <div className="absolute inset-0 bg-transparent z-10" />
                        </div>
                    )}

                    {(!['image', 'pdf'].includes(fileType) || !previewUrl) && (
                        <FileText size={40} className="text-brand-text-02/40 group-hover:text-system-color-02/60 transition-colors" />
                    )}

                    {/* Action Buttons (Overlay) */}
                    <div className="absolute top-2 right-2 flex gap-2 z-50">
                        {/* Download Button */}
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (!downloadUrl) return;

                                try {
                                    const response = await fetch(downloadUrl);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = path.split('/').pop(); // Extract filename from path
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (error) {
                                    console.error('Download failed:', error);
                                    toast.error('Failed to download file');
                                }
                            }}
                            className={`p-2 bg-white/90 backdrop-blur-sm border border-brand-text-02/10 rounded-lg text-brand-text-02 hover:text-system-color-02 hover:bg-white transition-all shadow-sm ${!downloadUrl ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}`}
                            title="Download File"
                        >
                            <Download size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick();
                            }}
                            className="p-2 bg-white/90 backdrop-blur-sm border border-error/20 rounded-lg text-error hover:bg-error/10 transition-all shadow-sm cursor-pointer hover:scale-105"
                            title="Remove Document"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="h-10 px-3 flex items-center justify-between bg-white border-t border-system-color-02/10">
                    <span className="text-xs font-bold text-brand-text-02 truncate max-w-[120px]" title={title}>{title}</span>
                    <CheckCircle size={16} className="text-system-color-02 flex-shrink-0" />
                </div>

                <SecurityModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={executeDelete}
                    title="Delete Document"
                    actionType="danger"
                    isLoading={isDeleting}
                />
            </div>
        );
    }

    // State B: Not Uploaded
    return (
        <div className="group flex flex-col h-40 bg-brand-text-02/5 rounded-xl border border-dashed border-brand-text-02/20 overflow-hidden relative hover:border-brand-color-01/40 hover:bg-brand-color-01/5 transition-all">
            {isUploading && (
                <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-color-01" size={24} />
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUpload}
                accept={type === 'photo' ? 'image/*' : '.pdf,.jpg,.jpeg,.png'}
            />

            {/* Ghost Area */}
            <div className="flex-grow flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="p-3 rounded-full bg-brand-text-02/5 text-brand-text-02/40 group-hover:bg-brand-color-01/10 group-hover:text-brand-color-01 transition-colors">
                    <Upload size={24} />
                </div>
                <span className="text-xs font-medium text-brand-text-02/60 group-hover:text-brand-color-01 transition-colors">Click to Upload</span>
            </div>

            {/* Footer */}
            <div className="h-10 px-3 flex items-center justify-between bg-brand-text-02/5 border-t border-dashed border-brand-text-02/10 group-hover:border-brand-color-01/20 group-hover:bg-brand-color-01/5">
                <span className="text-xs font-medium text-brand-text-02/60 truncate group-hover:text-brand-text-02">{title}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-system-color-01 uppercase tracking-wider group-hover:opacity-0 transition-opacity">Missing</span>
                    <XCircle size={16} className="text-system-color-01 flex-shrink-0 group-hover:hidden" />
                    <Plus size={16} className="text-brand-color-01 hidden group-hover:block" />
                </div>
            </div>
        </div>
    );
};

const PetIdentifierInputs = ({ pet, bookingId }) => {
    const [microchip, setMicrochip] = useState(pet.microchip_id || '');
    const [passport, setPassport] = useState(pet.passport_number || '');
    const [medAlerts, setMedAlerts] = useState(
        Array.isArray(pet.medicalAlerts)
            ? pet.medicalAlerts.map(a => (typeof a === 'string' ? a : a.label || a.name || '')).join(', ')
            : (pet.medical_alerts || '')
    );
    const [specReqs, setSpecReqs] = useState(pet.specialRequirements || '');
    const [saving, setSaving] = useState(null); // field key being saved

    // Sync with PetProfilesSection drawer saves
    React.useEffect(() => {
        const handler = (e) => {
            if (e.detail?.petId !== pet.id) return;
            const d = e.detail;
            if (d.microchip_id !== undefined) setMicrochip(d.microchip_id ?? '');
            if (d.passport_number !== undefined) setPassport(d.passport_number ?? '');
            if (d.medicalAlerts !== undefined) {
                setMedAlerts(
                    Array.isArray(d.medicalAlerts)
                        ? d.medicalAlerts.map(a => (typeof a === 'string' ? a : a.label || a.name || '')).join(', ')
                        : (d.medicalAlerts || '')
                );
            }
            if (d.specialRequirements !== undefined) setSpecReqs(d.specialRequirements ?? '');
        };
        window.addEventListener('pawpaths:pet-updated', handler);
        return () => window.removeEventListener('pawpaths:pet-updated', handler);
    }, [pet.id]);

    const handleBlur = async (field, value, original) => {
        if (value === original) return; // unchanged — skip round-trip

        setSaving(field);
        const labels = {
            microchip_id: 'Microchip number',
            passport_number: 'Passport number',
            medical_alerts: 'Medical alerts',
            specialRequirements: 'Special requirements',
        };

        const result = await updatePetFields(
            pet.id,
            { [field]: value },
            field === 'specialRequirements' ? bookingId : null
        );
        setSaving(null);

        if (result.success) {
            toast.success(`${labels[field]} updated`);
            // Notify PetProfilesSection so its local state + editingPet stay current
            const medAlertsArr = field === 'medical_alerts'
                ? (value.trim() ? [value.trim()] : [])
                : undefined;
            window.dispatchEvent(new CustomEvent('pawpaths:pet-updated', {
                detail: {
                    petId: pet.id,
                    microchip_id: field === 'microchip_id' ? value : microchip,
                    passport_number: field === 'passport_number' ? value : passport,
                    ...(medAlertsArr !== undefined && { medicalAlerts: medAlertsArr }),
                    ...(field === 'specialRequirements' && { specialRequirements: value }),
                },
            }));
        } else {
            toast.error(`Failed to save ${labels[field]}`);
        }
    };

    const inputCls = 'w-full px-3 py-2.5 pr-9 text-sm border border-gray-200 rounded-lg shadow-sm bg-white/70 text-brand-text-02 placeholder:text-brand-text-02/30 focus:outline-none focus:ring-2 focus:ring-system-color-02/30 focus:border-system-color-02/50 transition-all';

    return (
        <div className="mt-5 pt-5 border-t border-brand-text-02/10 space-y-4">
            {/* Row 1: Microchip + Passport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">
                        Microchip Number
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={microchip}
                            onChange={e => setMicrochip(e.target.value)}
                            onBlur={() => handleBlur('microchip_id', microchip, pet.microchip_id || '')}
                            placeholder="e.g. 985141002512345"
                            className={`${inputCls} font-bold`}
                        />
                        {saving === 'microchip_id' && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-system-color-02 animate-spin" />
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">
                        Pet Passport Number
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={passport}
                            onChange={e => setPassport(e.target.value)}
                            onBlur={() => handleBlur('passport_number', passport, pet.passport_number || '')}
                            placeholder="e.g. AE-12345678"
                            className={`${inputCls} font-bold`}
                        />
                        {saving === 'passport_number' && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-system-color-02 animate-spin" />
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Special Requirements (left) + Medical Alerts (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">
                        Special Travel Requirements
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={specReqs}
                            onChange={e => setSpecReqs(e.target.value)}
                            onBlur={() => handleBlur('specialRequirements', specReqs, pet.specialRequirements || '')}
                            placeholder="e.g. Needs sedation, fragile crate…"
                            className={`${inputCls} text-xs`}
                        />
                        {saving === 'specialRequirements' && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-system-color-02 animate-spin" />
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">
                        Medical Alerts
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={medAlerts}
                            onChange={e => setMedAlerts(e.target.value)}
                            onBlur={() => handleBlur('medical_alerts', medAlerts,
                                Array.isArray(pet.medicalAlerts)
                                    ? pet.medicalAlerts.map(a => (typeof a === 'string' ? a : a.label || a.name || '')).join(', ')
                                    : (pet.medical_alerts || '')
                            )}
                            placeholder="e.g. Allergies, medications…"
                            className={`${inputCls} text-xs`}
                        />
                        {saving === 'medical_alerts' && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-system-color-02 animate-spin" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Compact stat cell used in the header info bar ─────────────────────── */
const InfoCell = ({ label, value }) => (
    <div className="flex flex-col justify-center px-4 py-2 min-w-0">
        <span className="font-jakarta text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">
            {label}
        </span>
        <span className="font-baloo font-bold text-[17px] text-[#005F00] truncate leading-tight">
            {value || '—'}
        </span>
    </div>
);

const DocumentStatusSection = ({ booking }) => {
    const pets = booking?.pets && booking.pets.length > 0 ? booking.pets : [{ id: 'default', name: '', breed: 'Pet' }];

    return (
        <div className="space-y-6 mb-6">
            {pets.map((pet, idx) => {
                const petName = pet.name || pet.breed || 'Pet';
                const isFirst = idx === 0;

                // Avatar: prefer pet's own photo, fall back to breed default
                const avatarSrc = pet.photoUrl || pet.breedPhotoUrl || null;

                // For first pet, use the primary booking path. For others, query into extraDocuments.
                const extraDocs = booking.extraDocuments?.[pet.id] || {};

                const photoPath = isFirst ? booking.pet_photo_path : extraDocs.photo;
                const passportPath = isFirst ? booking.passport_path : extraDocs.passport;
                const vacPath = isFirst ? booking.vaccination_path : extraDocs.vaccination;
                const rabiesPath = isFirst ? booking.rabies_path : extraDocs.rabies;

                const passportUrl = isFirst ? booking.passportUrl : extraDocs.passportUrl;
                const vacUrl = isFirst ? booking.vaccinationUrl : extraDocs.vaccinationUrl;
                const rabiesUrl = isFirst ? booking.rabiesUrl : extraDocs.rabiesUrl;

                const ageDisplay = pet.age != null && pet.age !== ''
                    ? `${pet.age} ${pet.ageUnit === 'months' ? 'Mo' : 'Yrs'}`
                    : null;
                const weightDisplay = pet.weight != null && pet.weight !== ''
                    ? `${pet.weight} KG`
                    : null;
                const breedDisplay = pet.type && pet.breed
                    ? `${pet.type} ( ${pet.breed} )`
                    : (pet.type || pet.breed || null);

                return (
                    <div key={pet.id || idx} className="bg-surface-pearl rounded-2xl shadow-sm border-[0.5px] border-brand-text-02/15 overflow-hidden">

                        {/* ── Header Info Bar ─────────────────────────────────── */}
                        <div className="bg-gray-50/80 border-b border-brand-text-02/10 px-5 py-4">
                            <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-0">

                                {/* Avatar + Title block */}
                                <div className="flex items-center gap-3 flex-shrink-0 md:pr-5 md:border-r md:border-brand-text-02/15">
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-brand-text-02/20 bg-brand-text-02/5 flex-shrink-0">
                                        {avatarSrc ? (
                                            <Image
                                                src={avatarSrc}
                                                alt={petName}
                                                fill
                                                className="object-cover"
                                                sizes="56px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl select-none">🐾</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span
                                            className="font-bold text-base text-system-color-02 tracking-wide leading-tight"
                                            style={{ fontFamily: 'var(--font-baloo), cursive' }}
                                        >
                                            Pet Details
                                        </span>
                                        <span className="text-[10px] text-brand-text-02/45 uppercase font-bold tracking-widest leading-tight mt-0.5">
                                            Documents &amp; Compliances
                                        </span>
                                    </div>
                                </div>

                                {/* Info cells — divided on desktop, wrapped on mobile */}
                                <div className="flex flex-wrap md:flex-nowrap md:items-stretch md:divide-x divide-brand-text-02/10">
                                    <InfoCell label="Name" value={petName} />
                                    <InfoCell label="Species and Breed" value={breedDisplay} />
                                    <InfoCell label="Gender" value={pet.gender} />
                                    <InfoCell label="Age" value={ageDisplay} />
                                    <InfoCell label="Weight" value={weightDisplay} />
                                </div>
                            </div>
                        </div>

                        {/* ── Document Cards + Inputs ─────────────────────────── */}
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* 1. Pet Photo (Public) */}
                                <DocumentFrame
                                    title={`Photo - ${petName}`}
                                    type={isFirst ? "photo" : `photo_${pet.id}`}
                                    path={photoPath}
                                    isPrivate={false}
                                    bookingId={booking.id}
                                />

                                {/* 2. Pet Passport (Private) */}
                                <DocumentFrame
                                    title={`Passport - ${petName}`}
                                    type={isFirst ? "passport" : `passport_${pet.id}`}
                                    path={passportPath}
                                    isPrivate={true}
                                    preSignedUrl={passportUrl}
                                    bookingId={booking.id}
                                />

                                {/* 3. Vaccination Records (Private) */}
                                <DocumentFrame
                                    title={`Vaccination - ${petName}`}
                                    type={isFirst ? "vaccination" : `vaccination_${pet.id}`}
                                    path={vacPath}
                                    isPrivate={true}
                                    preSignedUrl={vacUrl}
                                    bookingId={booking.id}
                                />

                                {/* 4. Rabies Certificate (Private) */}
                                <DocumentFrame
                                    title={`Rabies - ${petName}`}
                                    type={isFirst ? "rabies" : `rabies_${pet.id}`}
                                    path={rabiesPath}
                                    isPrivate={true}
                                    preSignedUrl={rabiesUrl}
                                    bookingId={booking.id}
                                />
                            </div>

                            {/* Identifiers + Medical/Requirements — editable inline fields */}
                            {pet.id && pet.id !== 'default' && (
                                <PetIdentifierInputs pet={pet} bookingId={booking.id} />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentStatusSection;
