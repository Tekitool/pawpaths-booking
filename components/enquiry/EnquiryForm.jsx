'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, FileText, CheckCircle, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadFile, STORAGE_BUCKETS } from '@/lib/services/storage';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input'; // Assuming Input exists, or I'll use standard input

export default function EnquiryForm() {
    // Task 1: Setup Form State & Session
    const sessionId = useRef(null);
    const [isSessionReady, setIsSessionReady] = useState(false);

    // State for File Objects (for local preview)
    const [petPhotoFile, setPetPhotoFile] = useState(null);
    const [documentFiles, setDocumentFiles] = useState([]); // Array for multiple docs if needed, or single based on requirements. Request implies "Documents Section" but "documents_path" singular. I'll assume single for now or folder. "documents_path (the folder or specific file path)". I'll handle single file for simplicity as per "Input: Accept application/pdf, image/*".

    // State for Upload Paths (for database)
    const [petPhotoPath, setPetPhotoPath] = useState('');
    const [documentPath, setDocumentPath] = useState('');

    // Loading states
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    // Initialize Session ID on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !sessionId.current) {
            sessionId.current = crypto.randomUUID();
            setIsSessionReady(true);
            console.log('Enquiry Session ID:', sessionId.current);
        }
    }, []);

    // Task 2: Create the handleUpload Wrapper
    const handleUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        // Ensure session is ready
        if (!sessionId.current) {
            alert('Session not initialized. Please refresh.');
            return;
        }

        try {
            if (type === 'photo') {
                setUploadingPhoto(true);
                // Local Preview
                setPetPhotoFile(file);

                // Upload to Storage
                const path = await uploadFile({
                    file,
                    bucket: STORAGE_BUCKETS.PHOTOS,
                    folder: `enquiries/${sessionId.current}/photos`
                });

                setPetPhotoPath(path);
            } else if (type === 'document') {
                setUploadingDoc(true);
                // Local Preview (Generic)
                setDocumentFiles([file]); // Keeping as array for potential future expansion

                // Upload to Storage
                const path = await uploadFile({
                    file,
                    bucket: STORAGE_BUCKETS.DOCUMENTS,
                    folder: `enquiries/${sessionId.current}/documents`
                });

                setDocumentPath(path);
            }
        } catch (error) {
            console.error(`${type} upload failed:`, error);
            alert(`Failed to upload ${type}: ${error.message}`);
            // Reset preview on failure
            if (type === 'photo') setPetPhotoFile(null);
            if (type === 'document') setDocumentFiles([]);
        } finally {
            if (type === 'photo') setUploadingPhoto(false);
            if (type === 'document') setUploadingDoc(false);
        }
    };

    // Task 4: Submission Payload
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!petPhotoPath || !documentPath) {
            alert('Please upload both a pet photo and a document.');
            return;
        }

        const payload = {
            enquiry_session_id: sessionId.current,
            pet_photo_path: petPhotoPath,
            documents_path: documentPath, // Or the folder path if you prefer: `enquiries/${sessionId.current}/documents`
            // ... other form fields
        };

        console.log('Submitting Payload:', payload);
        alert('Enquiry Submitted! Check console for payload.');
        // Call your API to save to DB
    };

    if (!isSessionReady) return null; // or a loading spinner

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-4">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Pet Details & Documents</h2>
                <p className="text-gray-500">Please upload a photo of your pet and their travel documents.</p>
            </div>

            {/* Task 3: Implement the UI Components */}

            {/* Pet Photo Section */}
            <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                        Cover Photo (Public)
                    </label>
                    {petPhotoPath && <span className="text-xs text-green-600 font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Uploaded</span>}
                </div>

                <div className="flex items-start space-x-6">
                    {/* Preview Area */}
                    <div className="relative w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                        {petPhotoFile ? (
                            <Image
                                src={URL.createObjectURL(petPhotoFile)}
                                alt="Pet Preview"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                        {uploadingPhoto && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-brand-color-01" />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, 'photo')}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-brand-color-01/10 file:text-brand-color-01
                                hover:file:bg-brand-color-01/20
                                cursor-pointer"
                            disabled={uploadingPhoto}
                        />
                        <p className="text-xs text-gray-500">
                            Upload a clear photo of your pet. This will be used for their profile.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Documents Section */}
            <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                        Passport / Vaccination (Secure)
                    </label>
                    {documentPath && <span className="text-xs text-green-600 font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Uploaded</span>}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="application/pdf, image/*"
                                onChange={(e) => handleUpload(e, 'document')}
                                className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    cursor-pointer"
                                disabled={uploadingDoc}
                            />
                        </div>
                        {uploadingDoc && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                    </div>

                    {/* Document Preview Badge */}
                    {documentFiles.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <FileText className="w-4 h-4 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-900">File Uploaded</p>
                                    <p className="text-xs text-green-700">{documentFiles[0].name}</p>
                                </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Upload your pet&apos;s passport or vaccination records. These are stored securely and are not public.
                    </p>
                </div>
            </Card>

            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                    Submit Enquiry
                </Button>
            </div>
        </form >
    );
}
