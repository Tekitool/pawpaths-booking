'use client';

import React, { useRef, useState, useEffect } from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, Loader2, Camera, PawPrint, Dog, Cat, Bird, Turtle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadFile, STORAGE_BUCKETS } from '@/lib/services/storage';

// ─────────────────────────────────────────────────────────
// Species Icon + Color Mapping
// ─────────────────────────────────────────────────────────
const SPECIES_CONFIG = {
    dog: { Icon: Dog, color: 'text-blue-600', bg: 'from-blue-100/80 to-blue-50/60', border: 'border-blue-200/50', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    cat: { Icon: Cat, color: 'text-purple-600', bg: 'from-purple-100/80 to-purple-50/60', border: 'border-purple-200/50', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    bird: { Icon: Bird, color: 'text-emerald-600', bg: 'from-emerald-100/80 to-emerald-50/60', border: 'border-emerald-200/50', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    reptile: { Icon: Turtle, color: 'text-teal-700', bg: 'from-teal-100/80 to-teal-50/60', border: 'border-teal-200/50', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    exotic: { Icon: Turtle, color: 'text-teal-700', bg: 'from-teal-100/80 to-teal-50/60', border: 'border-teal-200/50', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
};
const DEFAULT_SPECIES_CONFIG = { Icon: PawPrint, color: 'text-orange-500', bg: 'from-brand-color-01/15 to-brand-color-04/30', border: 'border-brand-color-01/10', badge: 'bg-orange-50 text-orange-700 border-orange-200' };

const getSpeciesConfig = (speciesName) => {
    if (!speciesName) return DEFAULT_SPECIES_CONFIG;
    return SPECIES_CONFIG[speciesName.toLowerCase()] || DEFAULT_SPECIES_CONFIG;
};

// ─────────────────────────────────────────────────────────
// Per-Pet Dropzone Box
// ─────────────────────────────────────────────────────────
const DropzoneBox = ({ id, title, subtext, accept, file, onUpload, onRemove, isUploading, icon: Icon }) => {
    const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('!border-brand-color-01', '!bg-brand-color-01/5'); };
    const handleDragLeave = (e) => { e.preventDefault(); e.currentTarget.classList.remove('!border-brand-color-01', '!bg-brand-color-01/5'); };
    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('!border-brand-color-01', '!bg-brand-color-01/5');
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            onUpload({ target: { files: [droppedFile] } });
        }
    };

    return (
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-brand-color-01" />
                <h4 className="text-sm font-semibold text-brand-text-02">{title}</h4>
                {file && (
                    <div className="bg-success/15 text-success p-1 rounded-full animate-in zoom-in duration-300 ml-auto">
                        <CheckCircle size={16} strokeWidth={3} />
                    </div>
                )}
            </div>
            <p className="text-xs text-brand-text-02/60 mb-3">{subtext}</p>

            {!file ? (
                <div className="relative group/upload">
                    <input
                        type="file"
                        id={id}
                        className="hidden"
                        onChange={onUpload}
                        accept={accept}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor={id}
                        className={`flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50/60 hover:border-blue-400 transition-colors rounded-xl p-6 sm:p-8 text-center cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isUploading ? (
                            <Loader2 className="w-7 h-7 animate-spin text-brand-color-01" />
                        ) : (
                            <>
                                <div className="p-2.5 bg-white rounded-full shadow-sm mb-2 group-hover/upload:scale-110 transition-transform duration-300 text-brand-text-02/60 group-hover/upload:text-brand-color-01">
                                    <UploadCloud size={22} />
                                </div>
                                <span className="text-xs font-bold text-brand-text-02 group-hover/upload:text-brand-color-01 transition-colors">
                                    Click or drag to upload
                                </span>
                                <span className="text-[10px] text-brand-text-02/50 mt-1">Max 5MB</span>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-xl border border-brand-text-02/15 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-gradient-to-br from-brand-color-01/10 to-brand-color-01/5 p-2 rounded-xl border border-brand-color-01/10 shadow-inner">
                            <FileText size={16} className="text-brand-color-01" />
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-bold text-brand-text-02 truncate max-w-[180px]">{file.name}</p>
                            <p className="text-[10px] text-brand-text-02/60 font-medium mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-error/10 text-brand-text-02/60 hover:text-system-color-01 rounded-xl transition-all duration-300"
                        title="Remove file"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// Per-Pet Document Frame
// ─────────────────────────────────────────────────────────
const PetDocumentFrame = ({ pet, petIndex, sessionId, uploading, setUploading, petDocs, updatePetDocs, setFormData, validateFile }) => {
    const petName = pet.name || `Pet ${petIndex + 1}`;

    const handleFileChange = async (docType, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) {
            if (e.target?.value) e.target.value = '';
            return;
        }

        const uploadKey = `${petIndex}-${docType}`;
        try {
            setUploading(prev => ({ ...prev, [uploadKey]: true }));

            if (!sessionId) {
                toast({ variant: "error", title: "System Error", description: "Session ID missing. Please refresh the page." });
                return;
            }

            const isPhoto = docType === 'photo';
            const bucket = isPhoto ? STORAGE_BUCKETS.PHOTOS : STORAGE_BUCKETS.DOCUMENTS;
            const folder = isPhoto
                ? `enquiries/${sessionId}/pet-${petIndex}/photos`
                : `enquiries/${sessionId}/pet-${petIndex}/documents`;

            const path = await uploadFile({ file, bucket, folder });

            // Update per-pet docs in store
            updatePetDocs(petIndex, { [docType]: file });

            // Update per-pet path in formData
            const pathKey = isPhoto ? `pet_${petIndex}_photo_path` : `pet_${petIndex}_medical_path`;
            setFormData(prev => ({
                ...prev,
                [pathKey]: path,
                // Legacy compat: also write first pet paths to the flat fields
                ...(petIndex === 0 && isPhoto ? { pet_photo_path: path } : {}),
                ...(petIndex === 0 && !isPhoto ? { passport_path: path, documents_path: `enquiries/${sessionId}/pet-${petIndex}/documents` } : {}),
            }));

            toast({ variant: "success", title: "Upload Successful", description: `${file.name} uploaded for ${petName}.` });
        } catch (error) {
            console.error('Upload failed:', error);
            toast({ variant: "error", title: "Upload Failed", description: `Error: ${error.message || 'Unknown error'}` });
            if (e.target?.value) e.target.value = '';
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    const removeFile = (docType) => {
        updatePetDocs(petIndex, { [docType]: null });

        const inputId = `file-${petIndex}-${docType}`;
        const fileInput = document.getElementById(inputId);
        if (fileInput) fileInput.value = '';

        const isPhoto = docType === 'photo';
        const pathKey = isPhoto ? `pet_${petIndex}_photo_path` : `pet_${petIndex}_medical_path`;
        setFormData(prev => ({
            ...prev,
            [pathKey]: null,
            ...(petIndex === 0 && isPhoto ? { pet_photo_path: null } : {}),
            ...(petIndex === 0 && !isPhoto ? { passport_path: null } : {}),
        }));
    };

    const speciesConfig = getSpeciesConfig(pet.speciesName);
    const SpeciesIcon = speciesConfig.Icon;

    return (
        <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${petIndex * 100}ms` }}>
            {/* Pet Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${speciesConfig.bg} flex items-center justify-center shadow-sm border ${speciesConfig.border}`}>
                    <SpeciesIcon size={20} className={speciesConfig.color} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-brand-text-02">Documents for {petName}</h3>
                    <p className="text-xs text-brand-text-02/60 mt-0.5">Upload photo and medical records</p>
                </div>
                <span className={`ml-auto text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg border ${speciesConfig.badge}`}>
                    Pet {petIndex + 1}
                </span>
            </div>

            {/* Upload Boxes — side by side on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Box 1: Identity Photo */}
                <DropzoneBox
                    id={`file-${petIndex}-photo`}
                    title={`Upload a photo of ${petName}`}
                    subtext="A clear, recent photo. (JPG, PNG)"
                    accept=".jpg,.jpeg,.png"
                    required={false}
                    file={petDocs?.photo || null}
                    onUpload={(e) => handleFileChange('photo', e)}
                    onRemove={() => removeFile('photo')}
                    isUploading={uploading[`${petIndex}-photo`]}
                    icon={Camera}
                />

                {/* Box 2: Master Medical Document */}
                <DropzoneBox
                    id={`file-${petIndex}-medicalDocs`}
                    title={`Passport & Medical Records for ${petName}`}
                    subtext="Multi-page PDF with passport, microchip, rabies & vaccination history."
                    accept=".pdf,.jpg,.jpeg,.png"
                    required={true}
                    file={petDocs?.medicalDocs || null}
                    onUpload={(e) => handleFileChange('medicalDocs', e)}
                    onRemove={() => removeFile('medicalDocs')}
                    isUploading={uploading[`${petIndex}-medicalDocs`]}
                    icon={FileText}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// Main Step 4 Component
// ─────────────────────────────────────────────────────────
export default function Step4Documents() {
    const { formData, setFormData } = useBookingStore();
    const pets = formData.pets || [];

    // Per-pet document state (local only — File objects must NOT be persisted to store/server)
    const [petDocuments, setPetDocuments] = useState(() => {
        const init = {};
        pets.forEach((_, i) => {
            init[i] = { photo: null, medicalDocs: null };
        });
        return init;
    });

    const sessionId = useRef(null);
    const [uploading, setUploading] = useState({});

    // Session ID initialization — run once on mount only
    useEffect(() => {
        if (!sessionId.current) {
            if (formData.enquiry_session_id) {
                sessionId.current = formData.enquiry_session_id;
            } else {
                const newSessionId = crypto.randomUUID();
                sessionId.current = newSessionId;
                setFormData(prev => ({ ...prev, enquiry_session_id: newSessionId }));
                console.log('[Step4Documents] Generated new session ID:', newSessionId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount — sessionId ref guards against double-fire

    // Sync petDocuments when pets array changes (e.g. user goes back and adds/removes a pet)
    useEffect(() => {
        setPetDocuments(prev => {
            const updated = {};
            pets.forEach((_, i) => {
                updated[i] = prev[i] || { photo: null, medicalDocs: null };
            });
            return updated;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pets.length]);

    // NOTE: File objects are NOT persisted to the store — only upload paths are stored
    // (pet_N_photo_path, pet_N_medical_path) which are set in handleFileChange

    // File validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            toast({ variant: "error", title: "File too large!", description: `Maximum allowed size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` });
            return false;
        }
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
            toast({ variant: "error", title: "Invalid file type!", description: `Only PDF, JPG, JPEG, and PNG files are allowed.` });
            return false;
        }
        return true;
    };

    const updatePetDocs = (petIndex, docUpdate) => {
        setPetDocuments(prev => ({
            ...prev,
            [petIndex]: { ...prev[petIndex], ...docUpdate }
        }));
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6 sm:mb-10">
                <h2 className="text-brand-color-01 tracking-tight">Document Upload</h2>
                <p className="text-brand-text-02/80 mt-2">Upload documents for each of your pets</p>
            </div>

            {/* Note on Documents — Golden Hour Alert (kept from original) */}
            <div className="relative group w-full animate-[fadeIn_0.6s_ease-out]">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-orange-200/20 to-yellow-200/20 rounded-3xl blur-xl sm:blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-[pulse_4s_ease-in-out_infinite] will-change-[opacity]"></div>
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-50/50 via-orange-50/50 to-amber-100/50 border border-brand-color-04 rounded-3xl p-4 shadow-[0_4px_16px_rgba(245,158,11,0.05),0_0_32px_rgba(245,158,11,0.02),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.1),0_0_48px_rgba(245,158,11,0.05),0_0_0_1px_rgba(245,158,11,0.1)] hover:border-warning/30 hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-amber-300/0 via-orange-400/30 to-yellow-300/0 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] [box-shadow:0_0_20px_rgba(245,158,11,0.1)] pointer-events-none"></div>
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

            {/* Per-Pet Document Frames */}
            <div className="space-y-6">
                {pets.length > 0 ? (
                    pets.map((pet, index) => (
                        <PetDocumentFrame
                            key={index}
                            pet={pet}
                            petIndex={index}
                            sessionId={sessionId.current}
                            uploading={uploading}
                            setUploading={setUploading}
                            petDocs={petDocuments[index]}
                            updatePetDocs={updatePetDocs}
                            setFormData={setFormData}
                            validateFile={validateFile}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                        <PawPrint size={32} className="mx-auto text-brand-text-02/30 mb-3" />
                        <p className="text-sm text-brand-text-02/60 font-medium">No pets added yet</p>
                        <p className="text-xs text-brand-text-02/40 mt-1">Go back to Step 2 to add your pets</p>
                    </div>
                )}
            </div>
        </div>
    );
}
