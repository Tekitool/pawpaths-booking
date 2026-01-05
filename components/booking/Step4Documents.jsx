'use client';

import React, { useRef, useState, useEffect } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadFile, STORAGE_BUCKETS } from '@/lib/services/storage';

const DocumentUploadCard = ({ type, title, description, required, bgColor, border, file, onUpload, onRemove, isUploading }) => {
    return (
        <div className={`${bgColor} backdrop-blur-xl border-[0.5px] ${border} shadow-level-1 rounded-3xl p-4 hover:shadow-level-3 transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-color-01/5 rounded-2xl text-brand-color-01 group-hover:scale-110 transition-transform duration-300">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="text-brand-text-02 text-sm flex items-center gap-2">
                            {title}
                            {required && <span className="text-[10px] uppercase tracking-wider font-bold bg-error/10 text-system-color-01 px-2 py-0.5 rounded-lg border border-system-color-01">Required</span>}
                        </h3>
                        <p className="text-xs text-brand-text-02/80 mt-0.5">{description}</p>
                    </div>
                </div>
                {file && (
                    <div className="bg-success/15 text-success p-1.5 rounded-full animate-in zoom-in duration-300">
                        <CheckCircle size={20} strokeWidth={3} />
                    </div>
                )}
            </div>

            {!file ? (
                <div className="relative group/upload">
                    <input
                        type="file"
                        id={`file-${type}`}
                        className="hidden"
                        onChange={onUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                    />
                    <label
                        htmlFor={`file-${type}`}
                        className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-brand-text-02/20 rounded-2xl cursor-pointer bg-white/30 hover:bg-white/60 hover:border-brand-color-01/50 transition-all duration-300 group-hover/upload:shadow-inner ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-brand-color-01" />
                        ) : (
                            <>
                                <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover/upload:scale-110 transition-transform duration-300 text-brand-text-02/60 group-hover/upload:text-brand-color-01">
                                    <Upload size={18} />
                                </div>
                                <span className="text-xs text-brand-text-02 group-hover/upload:text-brand-color-01 font-bold transition-colors">Click to upload</span>
                                <span className="text-[10px] text-brand-text-02/60 mt-0.5">PDF, JPG, PNG (Max 2MB)</span>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-2 rounded-xl border border-brand-text-02/20 shadow-inner">
                            <span className="text-[10px] font-black text-brand-text-02/80 tracking-tighter">FILE</span>
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-bold text-brand-text-02 truncate max-w-[180px]">{file.name}</p>
                            <p className="text-[10px] text-brand-text-02/80 font-medium mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="p-1.5 hover:bg-error/10 text-brand-text-02/60 hover:text-system-color-01 rounded-xl transition-all duration-300"
                        title="Remove file"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default function Step4Documents() {
    const { formData, updateDocuments, setFormData } = useBookingStore();
    const files = formData.documents || {
        passport: null,
        vaccination: null,
        rabies: null,
        petPhoto: null
    };

    // Session ID for this booking flow (persisted in ref to avoid re-renders)
    const sessionId = useRef(null);
    const [uploading, setUploading] = useState({}); // Track uploading state per file type

    useEffect(() => {
        // Initialize session ID if not present
        if (!sessionId.current) {
            // Check if we already have one in formData (e.g. from previous step navigation)
            if (formData.enquiry_session_id) {
                sessionId.current = formData.enquiry_session_id;
            } else {
                const newSessionId = crypto.randomUUID();
                sessionId.current = newSessionId;
                // Update store with session ID immediately
                // We use a functional update to ensure we don't overwrite other concurrent changes
                setFormData(prev => ({ ...prev, enquiry_session_id: newSessionId }));
                console.log('[Step4Documents] Generated new session ID:', newSessionId);
            }
        } else {
            console.log('[Step4Documents] Using existing session ID:', sessionId.current);
        }
    }, [formData, setFormData]); // Run once on mount, guarded by sessionId ref

    // File validation constants
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            toast({
                variant: "error",
                title: "File too large!",
                description: `Maximum allowed size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
            });
            return false;
        }

        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
            toast({
                variant: "error",
                title: "Invalid file type!",
                description: `Only PDF, JPG, JPEG, and PNG files are allowed.`,
            });
            return false;
        }

        return true;
    };

    const handleFileChange = async (type, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!validateFile(file)) {
            e.target.value = ''; // Reset input
            return;
        }

        try {
            setUploading(prev => ({ ...prev, [type]: true }));

            if (!sessionId.current) {
                console.error('Session ID is missing!');
                toast({
                    variant: "error",
                    title: "System Error",
                    description: "Session ID missing. Please refresh the page.",
                });
                return;
            }

            // Determine bucket and folder
            let bucket = STORAGE_BUCKETS.DOCUMENTS;
            let folder = `enquiries/${sessionId.current}/documents`;

            if (type === 'petPhoto') {
                bucket = STORAGE_BUCKETS.PHOTOS;
                folder = `enquiries/${sessionId.current}/photos`;
            }

            // Upload to Supabase
            const path = await uploadFile({
                file,
                bucket,
                folder
            });

            // Update Store: 
            // 1. Update the 'documents' object for UI state (showing the file is selected)
            updateDocuments({ [type]: file });

            // 2. Update the specific path fields for the backend
            if (type === 'petPhoto') {
                setFormData(prev => ({ ...prev, pet_photo_path: path }));
            } else if (type === 'passport') {
                setFormData(prev => ({ ...prev, passport_path: path }));
            } else if (type === 'vaccination') {
                setFormData(prev => ({ ...prev, vaccination_path: path }));
            } else if (type === 'rabies') {
                setFormData(prev => ({ ...prev, rabies_path: path }));
            }

            // Always update the generic documents folder path as well
            setFormData(prev => ({ ...prev, documents_path: `enquiries/${sessionId.current}/documents` }));

            toast({
                variant: "success",
                title: "Upload Successful",
                description: `${file.name} has been uploaded securely.`,
            });

        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                variant: "error",
                title: "Upload Failed",
                description: `Error: ${error.message || 'Unknown error'}`,
            });
            e.target.value = ''; // Reset input
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const removeFile = (type) => {
        updateDocuments({ [type]: null });

        // Reset the file input value
        const fileInput = document.getElementById(`file-${type}`);
        if (fileInput) {
            fileInput.value = '';
        }

        // Optional: We could delete from storage here, but for an enquiry form, 
        // it's often safer to just unlink it in the UI and let a cleanup job handle unused files later.
        // We should also clear the path in formData if needed, but since we store the folder path for docs,
        // removing one doc doesn't mean the folder is empty.
        if (type === 'petPhoto') {
            setFormData(prev => ({ ...prev, pet_photo_path: null }));
        } else if (type === 'passport') {
            setFormData(prev => ({ ...prev, passport_path: null }));
        } else if (type === 'vaccination') {
            setFormData(prev => ({ ...prev, vaccination_path: null }));
        } else if (type === 'rabies') {
            setFormData(prev => ({ ...prev, rabies_path: null }));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-brand-color-01 tracking-tight">Document Upload</h2>
                <p className="text-brand-text-02/80 mt-2">Please upload the necessary documents for your pets</p>
            </div>

            {/* Note on Documents - Golden Hour Theme (Softer) */}
            <div className="relative group w-full animate-[fadeIn_0.6s_ease-out]">

                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-orange-200/20 to-yellow-200/20 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-[pulse_4s_ease-in-out_infinite]"></div>

                {/* Main Card */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-50/50 via-orange-50/50 to-amber-100/50 border border-brand-color-04 rounded-3xl p-4 shadow-[0_4px_16px_rgba(245,158,11,0.05),0_0_32px_rgba(245,158,11,0.02),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.1),0_0_48px_rgba(245,158,11,0.05),0_0_0_1px_rgba(245,158,11,0.1)] hover:border-warning/30 hover:-translate-y-1 transition-all duration-500">

                    {/* Glowing Border Animation */}
                    <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-amber-300/0 via-orange-400/30 to-yellow-300/0 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] [box-shadow:0_0_20px_rgba(245,158,11,0.1)] pointer-events-none"></div>

                    {/* Content */}
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.15),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-[bounce_2.4s_ease-in-out_infinite]">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-1">
                                Note on Documents
                            </h3>
                            <p className="text-brand-text-02 leading-relaxed font-medium text-xs">
                                You can skip uploading documents for now and provide them later via email or your customer portal.
                            </p>
                        </div>
                    </div>

                    {/* Inner Glow Line */}
                    <div className="absolute top-2 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-300/20 to-transparent"></div>
                </div>

                <style jsx>{`
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* 2. Pet Photo */}
                <DocumentUploadCard
                    type="petPhoto"
                    title="Pet Photo"
                    description="Recent clear photo of your pet"
                    required={false}
                    bgColor="bg-brand-text-02/5"
                    border="border-brand-text-02/20"
                    file={files.petPhoto}
                    onUpload={(e) => handleFileChange('petPhoto', e)}
                    onRemove={() => removeFile('petPhoto')}
                    isUploading={uploading.petPhoto}
                />
                {/* 3. Pet Passport */}
                <DocumentUploadCard
                    type="passport"
                    title="Pet Passport"
                    description="Copy of the main page with pet details"
                    required={true}
                    bgColor="bg-system-color-03/5"
                    border="border-system-color-03/30"
                    file={files.passport}
                    onUpload={(e) => handleFileChange('passport', e)}
                    onRemove={() => removeFile('passport')}
                    isUploading={uploading.passport}
                />
                {/* 4. Vaccination Records */}
                <DocumentUploadCard
                    type="vaccination"
                    title="Vaccination Records"
                    description="Up-to-date vaccination history"
                    required={true}
                    bgColor="bg-system-color-02/5"
                    border="border-system-color-02/30"
                    file={files.vaccination}
                    onUpload={(e) => handleFileChange('vaccination', e)}
                    onRemove={() => removeFile('vaccination')}
                    isUploading={uploading.vaccination}
                />
                {/* 5. Rabies Certificate */}
                <DocumentUploadCard
                    type="rabies"
                    title="Rabies Certificate"
                    description="Valid rabies vaccination certificate"
                    required={false}
                    bgColor="bg-brand-text-03/5"
                    border="border-brand-text-03/20"
                    file={files.rabies}
                    onUpload={(e) => handleFileChange('rabies', e)}
                    onRemove={() => removeFile('rabies')}
                    isUploading={uploading.rabies}
                />
            </div>
        </div>
    );
}
