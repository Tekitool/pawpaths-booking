'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Step4Documents() {
    const { formData, updateDocuments } = useBookingStore();
    const files = formData.documents || {
        passport: null,
        vaccination: null,
        rabies: null
    };

    // File validation constants
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`File size too large! Maximum allowed size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
            return false;
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
            alert(`Invalid file type! Only PDF, JPG, JPEG, and PNG files are allowed.\nYour file type: ${file.type || 'unknown'}`);
            return false;
        }

        return true;
    };

    const handleFileChange = (type, e) => {
        const file = e.target.files[0];
        if (file) {
            if (validateFile(file)) {
                updateDocuments({ [type]: file });
            } else {
                // Clear the input so user can select again
                e.target.value = '';
            }
        }
    };

    const removeFile = (type) => {
        updateDocuments({ [type]: null });
    };

    const DocumentUploadCard = ({ type, title, description, required }) => {
        const file = files[type];

        return (
            <div className="bg-surface rounded-lg border border-outline-variant p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-container rounded-full text-on-primary-container">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-on-surface flex items-center gap-2">
                                {title}
                                {required && <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full">Required</span>}
                            </h3>
                            <p className="text-sm text-gray-500">{description}</p>
                        </div>
                    </div>
                    {file && (
                        <CheckCircle className="text-primary" size={20} />
                    )}
                </div>

                {!file ? (
                    <div className="relative">
                        <input
                            type="file"
                            id={`file-${type}`}
                            className="hidden"
                            onChange={(e) => handleFileChange(type, e)}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                            htmlFor={`file-${type}`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-outline-variant rounded-lg cursor-pointer hover:bg-surface-variant/30 hover:border-primary transition-all group"
                        >
                            <Upload className="text-gray-400 group-hover:text-primary mb-2" size={24} />
                            <span className="text-sm text-gray-600 group-hover:text-primary font-medium">Click to upload</span>
                            <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-surface-variant/30 p-3 rounded-lg border border-outline-variant">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-white p-2 rounded border border-outline-variant">
                                <span className="text-xs font-bold text-primary">FILE</span>
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-medium text-on-surface truncate max-w-[150px]">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFile(type)}
                            className="p-2 hover:bg-error/10 text-gray-500 hover:text-error rounded-full transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-primary">Document Upload</h2>
                <p className="text-gray-600">Please upload the necessary documents for your pets</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <DocumentUploadCard
                    type="passport"
                    title="Pet Passport"
                    description="Copy of the main page with pet details"
                    required={true}
                />
                <DocumentUploadCard
                    type="vaccination"
                    title="Vaccination Records"
                    description="Up-to-date vaccination history"
                    required={true}
                />
                <DocumentUploadCard
                    type="rabies"
                    title="Rabies Certificate"
                    description="Valid rabies vaccination certificate"
                    required={false}
                />
            </div>

            <div className="bg-[#fff2b1] border border-[#4d341a]/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-[#4d341a] shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-sm font-semibold text-[#4d341a]">Note on Documents</h4>
                    <p className="text-sm text-[#4d341a]/80 mt-1">
                        You can skip uploading documents for now and provide them later via email or your customer portal.
                    </p>
                </div>
            </div>
        </div>
    );
}
