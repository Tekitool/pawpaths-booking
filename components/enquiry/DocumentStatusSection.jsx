'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Download, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getSecureDocumentUrl, getPublicUrl, STORAGE_BUCKETS } from '@/lib/services/storage';
import Image from 'next/image';

import { uploadBookingDocument, deleteBookingDocument } from '@/lib/actions/admin-booking-actions';
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

        console.log(`DocumentFrame: Processing path: ${path}, isPrivate: ${isPrivate}`);

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

                console.log(`DocumentFrame: Generated URLs for ${title}`, { preview: pUrl, download: dUrl });
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
                toast.error(`Upload failed: ${result.error}`);
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
            console.log('Deleting document with reason:', reason);
            const result = await deleteBookingDocument(bookingId, type, reason);
            if (!result.success) {
                toast.error(`Delete failed: ${result.error}`);
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

const DocumentStatusSection = ({ booking }) => {
    return (
        <div className="bg-surface-pearl rounded-2xl shadow-sm border-[0.5px] border-system-color-02/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-system-color-02/10 text-system-color-02 rounded-xl border border-system-color-02/20">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-system-color-02">Required Documents</h3>
                        <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">Verification</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-system-color-01 font-medium bg-system-color-01/10 px-3 py-1.5 rounded-lg border border-system-color-01/20">
                    <AlertCircle size={14} />
                    <span>All documents must be verified before travel</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Pet Photo (Public) */}
                <DocumentFrame
                    title="Pet Photo"
                    type="photo"
                    path={booking.pet_photo_path}
                    isPrivate={false}
                    bookingId={booking.id}
                />

                {/* 2. Pet Passport (Private) */}
                <DocumentFrame
                    title="Pet Passport"
                    type="passport"
                    path={booking.passport_path}
                    isPrivate={true}
                    preSignedUrl={booking.passportUrl}
                    bookingId={booking.id}
                />

                {/* 3. Vaccination Records (Private) */}
                <DocumentFrame
                    title="Vaccination Records"
                    type="vaccination"
                    path={booking.vaccination_path}
                    isPrivate={true}
                    preSignedUrl={booking.vaccinationUrl}
                    bookingId={booking.id}
                />

                {/* 4. Rabies Certificate (Private) */}
                <DocumentFrame
                    title="Rabies Certificate"
                    type="rabies"
                    path={booking.rabies_path}
                    isPrivate={true}
                    preSignedUrl={booking.rabiesUrl}
                    bookingId={booking.id}
                />
            </div>
        </div>
    );
};

export default DocumentStatusSection;
