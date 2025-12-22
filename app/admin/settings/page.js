'use client';

import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Mail, Lock, MessageCircle, Check, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';


export default function AdminSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mock User Role - In a real app, this would come from auth context
    const userRole = 'Admin';

    // Initial Settings State - using state to persist across renders
    const [initialSettings, setInitialSettings] = useState({
        siteName: 'Pawpaths Pets Relocation Services',
        supportEmail: 'info@pawpathsae.com',
        timezone: '(GMT+04:00) Dubai, Abu Dhabi, Muscat'
    });

    const [generalSettings, setGeneralSettings] = useState(initialSettings);
    const [hasChanges, setHasChanges] = useState(false);

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newSettings = { ...generalSettings, [name]: value };
        setGeneralSettings(newSettings);

        // Check if settings have changed from initial values
        const isChanged = JSON.stringify(newSettings) !== JSON.stringify(initialSettings);
        setHasChanges(isChanged);
    };

    const handleSaveClick = () => {
        if (hasChanges && userRole === 'Admin') {
            setShowConfirmModal(true);
        }
    };

    const confirmSave = () => {
        setIsSaving(true);
        setShowConfirmModal(false);

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setHasChanges(false);
            // Update initial settings to current to reset change detection
            setInitialSettings({ ...generalSettings });

            // Show success message
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage system configuration and preferences</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* General Settings */}
                <section className="lg:col-span-2 bg-[#e6f2ef] backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Globe size={100} />
                    </div>
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-pawpaths-cream/50 rounded-2xl text-pawpaths-brown">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">General Settings</h2>
                                <p className="text-sm text-gray-500">Basic information about the platform</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveClick}
                            disabled={!hasChanges || isSaving || userRole !== 'Admin'}
                            className={`
                                relative w-12 h-12 rounded-full flex items-center justify-center 
                                transition-all duration-300 ease-out group
                                ${hasChanges && userRole === 'Admin'
                                    ? 'bg-gradient-to-br from-[#2d8a76] to-[#247566] text-white cursor-pointer shadow-[0_4px_14px_0_rgba(45,138,118,0.5)] hover:shadow-[0_12px_30px_rgba(45,138,118,0.6)] hover:-translate-y-2 hover:scale-[1.15] active:scale-95 active:translate-y-0 ring-0 hover:ring-8 hover:ring-[#2d8a76]/15'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 shadow-none'}
                            `}
                            title={hasChanges ? "Save General Settings" : "No changes to save"}
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check
                                    size={24}
                                    strokeWidth={3}
                                    className={`transition-transform duration-300 ${hasChanges && userRole === 'Admin' ? 'group-hover:scale-110 group-hover:rotate-12' : ''}`}
                                />
                            )}
                        </button>
                    </div>
                    <div className="p-8 flex flex-col gap-6 relative z-10 flex-1">
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-bold text-gray-700 ml-1">Site Name</label>
                            <input
                                name="siteName"
                                value={generalSettings.siteName}
                                onChange={handleInputChange}
                                placeholder="Enter site name"
                                className="w-full bg-white border-none focus:ring-0 rounded-xl py-3 px-4 shadow-sm transition-all focus:shadow-md"
                            />
                        </div>
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-bold text-gray-700 ml-1">Support Email</label>
                            <input
                                name="supportEmail"
                                value={generalSettings.supportEmail}
                                onChange={handleInputChange}
                                placeholder="Enter support email"
                                className="w-full bg-white border-none focus:ring-0 rounded-xl py-3 px-4 shadow-sm transition-all focus:shadow-md"
                            />
                        </div>
                        <div className="space-y-2 w-full">
                            <label className="text-sm font-bold text-gray-700 ml-1">Timezone</label>
                            <div className="relative">
                                <select
                                    name="timezone"
                                    value={generalSettings.timezone}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border-none rounded-xl px-4 py-3 focus:ring-0 focus:outline-none appearance-none cursor-pointer shadow-sm transition-all focus:shadow-md"
                                >
                                    <option>(GMT+04:00) Dubai, Abu Dhabi, Muscat</option>
                                    <option>(GMT+00:00) London, Dublin, Lisbon</option>
                                    <option>(GMT-05:00) New York, Miami, Toronto</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Globe size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notifications / Other Settings */}
                <section className="bg-gradient-to-br from-pawpaths-cream/30 to-amber-50 rounded-3xl shadow-sm border border-amber-100 overflow-hidden relative flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Bell size={100} />
                    </div>
                    <div className="p-8 border-b border-amber-100/50 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                            <p className="text-sm text-gray-500">Manage alerts & emails</p>
                        </div>
                    </div>
                    <div className="p-8 flex flex-col gap-4 relative z-10 flex-1 justify-center">
                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-amber-100/50">
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-amber-600" />
                                <span className="font-medium text-gray-700">Email Notifications</span>
                            </div>
                            <div className="w-12 h-6 bg-amber-200 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-amber-100/50">
                            <div className="flex items-center gap-3">
                                <MessageCircle size={18} className="text-green-600" />
                                <span className="font-medium text-gray-700">WhatsApp Notifications</span>
                            </div>
                            <div className="w-12 h-6 bg-green-200 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-amber-100/50">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-amber-600" />
                                <span className="font-medium text-gray-700">Push Notifications</span>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Settings - Full Width or separate */}
                <section className="lg:col-span-3 bg-[#fdf8f1] backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Shield size={100} />
                    </div>
                    <div className="p-8 border-b border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-[#ff725c] shadow-sm">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-black">Security</h2>
                            <p className="text-sm text-gray-500">Protect your account and data</p>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 gap-8 relative z-10">
                        {/* Frame 1: Change Password */}
                        <div className="bg-[#ffe1e1] rounded-2xl p-6 border border-red-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Lock size={18} className="text-gray-400" /> Change Password
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-white border-none focus:ring-0 rounded-xl py-3 px-4 text-2xl tracking-widest shadow-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-white border-none focus:ring-0 rounded-xl py-3 px-4 text-2xl tracking-widest shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-white border-none focus:ring-0 rounded-xl py-3 px-4 text-2xl tracking-widest shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button className="bg-[#ffbca1] hover:bg-[#ffbca1]/90 text-white border-none rounded-xl px-6 py-3 shadow-sm">
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Frame 2: Two-Factor Authentication */}
                        <div className="bg-[#f1ebff] rounded-2xl p-6 border border-purple-100 flex flex-col justify-center">
                            <div className="flex flex-col gap-4 w-full">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Two-Factor Authentication</h3>
                                    <p className="text-gray-500 leading-relaxed">Add an extra layer of security to your account by requiring a code in addition to your password.</p>
                                </div>
                                <Button variant="outline" size="lg" className="whitespace-nowrap rounded-xl px-6 py-4 border-gray-200 bg-white hover:bg-gray-50 hover:text-pawpaths-brown hover:border-pawpaths-brown/30 transition-all shadow-sm w-full text-lg font-bold h-16">
                                    Enable Two-Factor Authentication
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-100 relative animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#e6f2ef] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2d8a76]">
                                <Save size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Save Changes?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to save the changes to General Settings?
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmSave}
                                    className="flex-1 py-3 bg-[#2d8a76] hover:bg-[#246e5e] text-white rounded-xl font-bold shadow-lg shadow-[#2d8a76]/30 transition-all duration-300"
                                >
                                    Yes, Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-[#2d8a76] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <div className="bg-white/20 p-2 rounded-full">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Success</h4>
                            <p className="text-xs text-white/90">Settings saved successfully</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
