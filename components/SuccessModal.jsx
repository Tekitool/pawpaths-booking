import React from 'react';
import { CheckCircle, Download, Share2, RefreshCw, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SuccessModal({ bookingData, onClose, onReset }) {
    if (!bookingData) return null;

    const handleDownload = () => {
        // ... (existing code)
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-300 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-pawpaths-brown hover:bg-pawpaths-cream/50 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-pawpaths-brown mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-600">
                        Your booking ID is <span className="font-mono font-bold text-black">{bookingData.bookingId}</span>
                    </p>
                </div>

                <div className="bg-pawpaths-cream/30 rounded-lg p-4 mb-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{bookingData.customerInfo?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium">{bookingData.travelDetails?.originCountry} → {bookingData.travelDetails?.destinationCountry}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Pets:</span>
                        <span className="font-medium">{bookingData.pets?.length} Pet(s)</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <a
                        href={bookingData.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                        <Share2 size={20} />
                        Share via WhatsApp
                    </a>

                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 bg-pawpaths-brown hover:bg-[#3d2815] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                        <Download size={20} />
                        Download Confirmation
                    </button>

                    <button
                        onClick={onReset}
                        className="w-full flex items-center justify-center gap-2 border-2 border-pawpaths-brown text-pawpaths-brown hover:bg-pawpaths-brown hover:text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                        <RefreshCw size={20} />
                        Make Another Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
