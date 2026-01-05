'use client';

import React, { useState } from 'react';
import { uploadFile, STORAGE_BUCKETS } from '@/lib/services/storage';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SecureDownloadButton from '@/components/ui/SecureDownloadButton';
import Card from '@/components/ui/Card';

export default function TestStoragePage() {
    const [photoPath, setPhotoPath] = useState('');
    const [docPath, setDocPath] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingPhoto(true);
            const path = await uploadFile({
                file,
                bucket: STORAGE_BUCKETS.PHOTOS,
                folder: 'test-uploads',
            });
            setPhotoPath(path);
        } catch (error) {
            console.error('Photo upload failed:', error);
            alert('Photo upload failed: ' + error.message);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingDoc(true);
            const path = await uploadFile({
                file,
                bucket: STORAGE_BUCKETS.DOCUMENTS,
                folder: 'test-docs',
            });
            setDocPath(path);
        } catch (error) {
            console.error('Document upload failed:', error);
            alert('Document upload failed: ' + error.message);
        } finally {
            setUploadingDoc(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Storage Service Test</h1>

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">1. Public Photo Upload & Optimization</h2>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
                    />
                    {uploadingPhoto && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>

                {photoPath && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Uploaded Path: {photoPath}</p>
                        <div className="relative w-64 h-64 border rounded-lg overflow-hidden bg-gray-100">
                            <OptimizedImage
                                bucket={STORAGE_BUCKETS.PHOTOS}
                                path={photoPath}
                                alt="Uploaded Pet Photo"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}
            </Card>

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">2. Secure Document Upload & Download</h2>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleDocUpload}
                        className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                    {uploadingDoc && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>

                {docPath && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Document Path: {docPath}</p>
                        <SecureDownloadButton
                            path={docPath}
                            label="Download Secure Document"
                            variant="filled"
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
