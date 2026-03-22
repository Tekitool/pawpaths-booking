'use client';

import { useState } from 'react';
import { Users, MapPin, Phone, Mail, Pencil, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import InternalNotesEditor from '@/components/admin/InternalNotesEditor';
import { updateCustomerProfile } from '@/lib/actions/admin-customer-actions';

// ─── validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits only after stripping formatting chars — must be 7–15 digits (ITU E.164)
const digitsOnly = (s) => s.replace(/\D/g, '');

function validate(data) {
    const errors = {};
    if (!data.fullName.trim()) {
        errors.fullName = 'Full name is required';
    }
    if (!data.email.trim()) {
        errors.email = 'Email address is required';
    } else if (!EMAIL_RE.test(data.email.trim())) {
        errors.email = 'Enter a valid email address';
    }
    if (!data.phone.trim()) {
        errors.phone = 'Phone number is required';
    } else {
        const digits = digitsOnly(data.phone);
        if (digits.length < 7 || digits.length > 15) {
            errors.phone = 'Enter a valid phone number (7–15 digits)';
        }
    }
    return errors; // empty object = valid
}

// ─── sub-component ────────────────────────────────────────────────────────────

function ProfileField({ icon, label, name, value, isEditing, onChange, type = 'text', error }) {
    const hasError = isEditing && !!error;
    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${
                hasError
                    ? 'bg-white border-error/40 shadow-sm'
                    : isEditing
                        ? 'bg-white border-brand-color-01/40 shadow-sm'
                        : 'bg-white/60 border-brand-color-02/20'
            }`}
        >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase ${hasError ? 'text-error/80' : 'text-brand-text-02/80'}`}>
                    {label}
                </p>
                {isEditing ? (
                    <>
                        <input
                            type={type}
                            name={name}
                            value={value}
                            onChange={onChange}
                            autoComplete="off"
                            className={`w-full bg-transparent text-gray-900 font-medium outline-none border-b pb-0.5 mt-0.5 transition-colors ${
                                hasError
                                    ? 'border-error/60 focus:border-error'
                                    : 'border-brand-color-01/40 focus:border-brand-color-01'
                            }`}
                        />
                        {hasError && (
                            <p className="flex items-center gap-1 text-xs text-error mt-1 font-medium">
                                <AlertCircle size={11} className="flex-shrink-0" />
                                {error}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="font-medium text-gray-900 truncate" title={value || undefined}>
                        {value || 'Not specified'}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CustomerProfileCard({ customerInfo, bookingId, initialNotes }) {
    const [isEditing, setIsEditing]       = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: customerInfo.fullName || '',
        email:    customerInfo.email    || '',
        phone:    customerInfo.phone    || '',
        city:     customerInfo.city     || '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear the error for this field as soon as the user starts correcting it
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCancel = () => {
        setFormData({
            fullName: customerInfo.fullName || '',
            email:    customerInfo.email    || '',
            phone:    customerInfo.phone    || '',
            city:     customerInfo.city     || '',
        });
        setErrors({});
        setIsEditing(false);
    };

    const handleSave = async () => {
        // Client-side validation gate
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // stop — don't hit the server
        }

        setIsSubmitting(true);
        try {
            const result = await updateCustomerProfile(customerInfo.id, formData);
            if (result.success) {
                toast.success('Customer profile updated');
                setErrors({});
                setIsEditing(false);
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch {
            toast.error('Unexpected error — please try again');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-brand-color-02/10 rounded-2xl shadow-sm border-[0.5px] border-brand-color-02/20 p-6 flex flex-col h-full">

            {/* ── Card Header ────────────────────────────────────────── */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 text-accent rounded-xl border border-accent/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-accent">Customer Profile</h2>
                        <p className="text-xs text-brand-text-02/80 uppercase font-bold tracking-wider">Client</p>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-medium text-brand-color-01 hover:text-brand-color-01/80 flex items-center gap-1 transition-colors"
                    >
                        <Pencil size={14} />
                        Edit Profile
                    </button>
                )}

                {isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 text-sm font-medium text-brand-text-02/70 hover:text-brand-text-02 border border-brand-text-02/20 rounded-lg hover:bg-brand-text-02/5 transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                            <X size={13} />
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-brand-color-01 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-1.5"
                        >
                            {isSubmitting
                                ? <Loader2 size={13} className="animate-spin" />
                                : <Check size={13} />
                            }
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* ── Fields ─────────────────────────────────────────────── */}
            <div className="space-y-4 flex-grow">
                <div className="grid grid-cols-1 gap-4">
                    <ProfileField
                        icon={<Users size={18} className="text-brand-text-02/60" />}
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        isEditing={isEditing}
                        onChange={handleChange}
                        error={errors.fullName}
                    />
                    <ProfileField
                        icon={<MapPin size={18} className="text-brand-text-02/60" />}
                        label="Location"
                        name="city"
                        value={formData.city}
                        isEditing={isEditing}
                        onChange={handleChange}
                    />
                    <ProfileField
                        icon={<Phone size={18} className="text-brand-text-02/60" />}
                        label="Phone / WhatsApp"
                        name="phone"
                        value={formData.phone}
                        isEditing={isEditing}
                        onChange={handleChange}
                        error={errors.phone}
                    />
                    <ProfileField
                        icon={<Mail size={18} className="text-brand-text-02/60" />}
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        isEditing={isEditing}
                        onChange={handleChange}
                        error={errors.email}
                    />
                </div>

                <InternalNotesEditor bookingId={bookingId} initialNotes={initialNotes} />
            </div>
        </div>
    );
}
