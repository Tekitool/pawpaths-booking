'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const DocumentUploadCard = ({ type, title, description, required, gradient, border, file, onUpload, onRemove }) => {
    return (
        <div className={`bg-gradient-to-br ${gradient} backdrop-blur-xl border-[0.5px] ${border} shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-3">
                            {title}
                            {required && <span className="text-[10px] uppercase tracking-wider font-bold bg-red-50 text-red-500 px-2 py-1 rounded-lg border border-red-100">Required</span>}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>
                </div>
                {file && (
                    <div className="bg-green-50 text-green-600 p-2 rounded-full animate-in zoom-in duration-300">
                        <CheckCircle size={24} strokeWidth={3} />
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
                    />
                    <label
                        htmlFor={`file-${type}`}
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-white/30 hover:bg-white/60 hover:border-primary/50 transition-all duration-300 group-hover/upload:shadow-inner"
                    >
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover/upload:scale-110 transition-transform duration-300 text-gray-400 group-hover/upload:text-primary">
                            <Upload size={24} />
                        </div>
                        <span className="text-sm text-gray-600 group-hover/upload:text-primary font-bold transition-colors">Click to upload</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 2MB)</span>
                    </label>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-3 rounded-xl border border-gray-100 shadow-inner">
                            <span className="text-[10px] font-black text-gray-500 tracking-tighter">FILE</span>
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all duration-300"
                        title="Remove file"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default function Step4Documents() {
    const { formData, updateDocuments } = useBookingStore();
    const files = formData.documents || {
        passport: null,
        vaccination: null,
        rabies: null,
        petPhoto: null
    };

    // File validation constants
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`File size too large! Maximum allowed size is 2MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary tracking-tight">Document Upload</h2>
                <p className="text-gray-500 mt-2">Please upload the necessary documents for your pets</p>
            </div>


            {/* Note on Documents - First */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className="text-base font-bold text-amber-900 mb-1">Note on Documents</h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed">
                        You can skip uploading documents for now and provide them later via email or your customer portal.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* 2. Pet Photo */}
                <DocumentUploadCard
                    type="petPhoto"
                    title="Pet Photo"
                    description="Recent clear photo of your pet"
                    required={false}
                    gradient="from-[#fff0f5] to-[#ffe8f1]"
                    border="border-[#ffc4e0]"
                    file={files.petPhoto}
                    onUpload={(e) => handleFileChange('petPhoto', e)}
                    onRemove={() => removeFile('petPhoto')}
                />
                {/* 3. Pet Passport */}
                <DocumentUploadCard
                    type="passport"
                    title="Pet Passport"
                    description="Copy of the main page with pet details"
                    required={true}
                    gradient="from-[#ebf8ff] to-[#dcf3ff]"
                    border="border-[#8ddfff]"
                    file={files.passport}
                    onUpload={(e) => handleFileChange('passport', e)}
                    onRemove={() => removeFile('passport')}
                />
                {/* 4. Vaccination Records */}
                <DocumentUploadCard
                    type="vaccination"
                    title="Vaccination Records"
                    description="Up-to-date vaccination history"
                    required={true}
                    gradient="from-[#f3ffeb] to-[#eaffdc]"
                    border="border-[#c8ffa4]"
                    file={files.vaccination}
                    onUpload={(e) => handleFileChange('vaccination', e)}
                    onRemove={() => removeFile('vaccination')}
                />
                {/* 5. Rabies Certificate */}
                <DocumentUploadCard
                    type="rabies"
                    title="Rabies Certificate"
                    description="Valid rabies vaccination certificate"
                    required={false}
                    gradient="from-[#f8f5ff] to-[#f1ebff]"
                    border="border-[#e7e0fc]"
                    file={files.rabies}
                    onUpload={(e) => handleFileChange('rabies', e)}
                    onRemove={() => removeFile('rabies')}
                />
            </div>
        </div>
    );
}
