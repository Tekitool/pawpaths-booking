'use client';

import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminSettings() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved successfully!');
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <Globe className="text-pawpaths-brown" size={20} />
                        <h2 className="text-lg font-bold text-gray-800">General Settings</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Site Name"
                            defaultValue="Pawpaths Pet Relocation"
                            placeholder="Enter site name"
                        />
                        <Input
                            label="Support Email"
                            defaultValue="support@pawpaths.com"
                            placeholder="Enter support email"
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pawpaths-brown focus:outline-none">
                                <option>(GMT+04:00) Dubai, Abu Dhabi, Muscat</option>
                                <option>(GMT+00:00) London, Dublin, Lisbon</option>
                                <option>(GMT-05:00) New York, Miami, Toronto</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Notification Settings */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <Bell className="text-pawpaths-brown" size={20} />
                        <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive email alerts for new bookings</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-pawpaths-brown focus:ring-pawpaths-brown" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">WhatsApp Alerts</p>
                                <p className="text-sm text-gray-500">Send automated WhatsApp messages to customers</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-pawpaths-brown focus:ring-pawpaths-brown" />
                        </div>
                    </div>
                </section>

                {/* Security Settings */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                        <Shield className="text-pawpaths-brown" size={20} />
                        <h2 className="text-lg font-bold text-gray-800">Security</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Current Password"
                                type="password"
                                placeholder="••••••••"
                            />
                            <div className="hidden md:block"></div>
                            <Input
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                </div>
                                <Button variant="outline" size="sm">Enable 2FA</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
