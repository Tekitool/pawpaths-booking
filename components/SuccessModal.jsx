import React from 'react';
import { CheckCircle, Download, Share2, RefreshCw, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SuccessModal({ bookingData, onClose, onReset }) {
    if (!bookingData) return null;

    const handleDownload = () => {
        try {
            const doc = new jsPDF();

            // Header Background
            doc.setFillColor(77, 52, 26); // #4d341a
            doc.rect(0, 0, 210, 50, 'F');

            // Logo Placeholder
            doc.setFillColor(255, 255, 255);
            doc.circle(105, 15, 10, 'F');
            doc.setTextColor(77, 52, 26);
            doc.setFontSize(8);
            doc.text('LOGO', 105, 15, { align: 'center', baseline: 'middle' });

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text('Pawpaths Pets Relocation', 105, 35, { align: 'center' });
            doc.setFontSize(12);
            doc.text('Booking Confirmation', 105, 43, { align: 'center' });

            // Reset Text Color
            doc.setTextColor(0, 0, 0);

            // Booking ID & Date
            doc.setFontSize(10);
            doc.text(`Booking ID: ${bookingData.bookingId}`, 14, 65);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 70);

            // Section: Customer & Travel Info
            doc.setFontSize(14);
            doc.setTextColor(77, 52, 26);
            doc.text('Customer Details', 14, 85);
            doc.text('Travel Details', 110, 85);

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            // Customer Info
            if (bookingData.customerInfo) {
                doc.text(`Name: ${bookingData.customerInfo.fullName || 'N/A'}`, 14, 95);
                doc.text(`Email: ${bookingData.customerInfo.email || 'N/A'}`, 14, 101);
                doc.text(`Phone: ${bookingData.customerInfo.phone || 'N/A'}`, 14, 107);
            }

            // Travel Info
            if (bookingData.travelDetails) {
                doc.text(`From: ${bookingData.travelDetails.originAirport || ''}, ${bookingData.travelDetails.originCountry || ''}`, 110, 95);
                doc.text(`To: ${bookingData.travelDetails.destinationAirport || ''}, ${bookingData.travelDetails.destinationCountry || ''}`, 110, 101);
                doc.text(`Travel Date: ${bookingData.travelDetails.travelDate ? new Date(bookingData.travelDetails.travelDate).toLocaleDateString() : 'N/A'}`, 110, 107);
            }

            // Section: Pets
            doc.setFontSize(14);
            doc.setTextColor(77, 52, 26);
            doc.text('Pet Details', 14, 125);

            const tableColumn = ["#", "Name", "Type", "Breed", "Age", "Weight (kg)", "Special Req."];
            const tableRows = bookingData.pets ? bookingData.pets.map((pet, index) => [
                index + 1,
                pet.name,
                pet.type,
                pet.breed,
                pet.age,
                pet.weight,
                pet.specialRequirements || '-'
            ]) : [];

            autoTable(doc, {
                startY: 130,
                head: [tableColumn],
                body: tableRows,
                headStyles: { fillColor: [77, 52, 26] },
                theme: 'grid',
                styles: { fontSize: 10 },
                columnStyles: {
                    6: { cellWidth: 40 }
                }
            });

            // Total Weight
            const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 130;
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Weight: ${bookingData.totalWeight || 0} kg`, 14, finalY);

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFillColor(255, 242, 177); // #fff2b1
            doc.rect(0, pageHeight - 30, 210, 30, 'F');

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text('Pawpaths Pets Relocation Services', 105, pageHeight - 18, { align: 'center' });
            doc.text('+971 58 694 7755 | bookings@pawpaths.com', 105, pageHeight - 12, { align: 'center' });

            doc.save(`Pawpaths-Booking-${bookingData.bookingId}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please check console for details.');
        }
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
