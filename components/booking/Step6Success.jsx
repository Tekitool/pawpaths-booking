'use client';

import React from 'react';
import useBookingStore from '@/lib/store/booking-store';
import Button from '@/components/ui/Button';
import { CheckCircle, FileDown, MessageCircle, Plus, LogOut, MapPin, Calendar, Dog, User, Mail, Phone, CreditCard, FileText, PlaneTakeoff, PlaneLanding, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/lib/constants/countries';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRAND_COLORS } from '@/lib/theme-config';

export default function Step6Success({ speciesList = [], breedsList = [] }) {
    const router = useRouter();
    const { formData, resetForm, setStep, bookingReference } = useBookingStore();
    const { travelDetails, pets, services, contactInfo } = formData;

    const getSpeciesName = (id) => {
        if (!id) return 'Unknown';
        // If name is already in pet object (from Step 5 enrichment), use it
        // Otherwise look it up from the list
        const species = speciesList.find(s => s.id === id);
        return species ? species.name : id;
    };

    const getBreedName = (id) => {
        if (!id) return 'Unknown';
        const breed = breedsList.find(b => b.id === id);
        return breed ? breed.name : id;
    };

    const handleClose = () => {
        window.location.href = 'https://pawpathsae.com/';
    };


    const getCountryLabel = (code) => {
        if (code === 'GB') return 'United Kingdom';
        return COUNTRIES.find(c => c.value === code)?.label || code;
    };

    const getServiceDetails = (id) => (formData.servicesData || []).find(s => s.id === id);

    const calculateTotal = () => {
        let total = 0;
        const petCount = Math.max(1, pets.length);
        (formData.servicesData || []).forEach(service => {
            if (service) total += Number(service.baseCost) * petCount;
        });
        return total;
    };

    const handleWhatsApp = () => {
        const petDetails = pets.map(p => `• ${p.name} (${p.speciesName || getSpeciesName(p.species_id)}/${p.breedName || getBreedName(p.breed_id)}, ${p.age} ${p.ageUnit || 'yrs'})`).join('\n');

        const rawMessage = `*I’ve just sent a new pet relocation booking enquiry.*` +
            `\n\n` +
            `*Reference:* ${bookingReference || 'PENDING'}\n` +
            `*Customer:* ${contactInfo.fullName}\n` +
            `\n` +
            `*Pets:*\n${petDetails}\n` +
            `\n` +
            `*Travel Details:*\n` +
            `• *Route:* ${getCountryLabel(travelDetails.originCountry)} → ${getCountryLabel(travelDetails.destinationCountry)}\n` +
            `• *Origin:* ${contactInfo.city || '-'}\n` +
            `• *Destination:* ${getCountryLabel(travelDetails.destinationCountry)}\n` +
            `• *Preferred Travel Date:* ${travelDetails.travelDate ? new Date(travelDetails.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}\n` +
            `\n` +
            `Kindly check the enquiry and confirm if all details are in order, or let me know if anything else is required.\n` +
            `\n` +
            `Warm regards.`;

        window.open(`https://wa.me/971586947755?text=${encodeURIComponent(rawMessage)}`, '_blank');
    };

    const handleLogout = () => {
        router.push('/');
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        const brandBrown = BRAND_COLORS.brand01.rgb;
        const brandOrange = BRAND_COLORS.brand03.rgb; // Brand Accent
        const lightBg = BRAND_COLORS.surfaces.warm.rgb; // Semantic Warm Surface

        // Helper to load image
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve(null);
            });
        };

        // Helper to format currency
        const formatCurrency = (amount) => {
            return `AED ${Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        // Helper to format date (dd/mm/yyyy)
        const formatDate = (dateStr) => {
            if (!dateStr) return 'TBD';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
        };

        // Load White Logo
        const logo = await loadImage('/pplogo-white.svg');
        const waIcon = await loadImage('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/120px-WhatsApp.svg.png');

        // WhatsApp Link
        const petDetails = pets.map(p => `• ${p.name} (${p.speciesName || getSpeciesName(p.species_id)}/${p.breedName || getBreedName(p.breed_id)}, ${p.age} ${p.ageUnit || 'yrs'})`).join('\n');

        const rawMessage = `*I’ve just sent a new pet relocation booking enquiry.*` +
            `\n\n` +
            `*Reference:* ${bookingReference || 'PENDING'}\n` +
            `*Customer:* ${contactInfo.fullName}\n` +
            `\n` +
            `*Pets:*\n${petDetails}\n` +
            `\n` +
            `*Travel Details:*\n` +
            `• *Route:* ${getCountryLabel(travelDetails.originCountry)} → ${getCountryLabel(travelDetails.destinationCountry)}\n` +
            `• *Origin:* ${contactInfo.city || '-'}\n` +
            `• *Destination:* ${getCountryLabel(travelDetails.destinationCountry)}\n` +
            `• *Preferred Travel Date:* ${travelDetails.travelDate ? new Date(travelDetails.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}\n` +
            `\n` +
            `Kindly check the enquiry and confirm if all details are in order, or let me know if anything else is required.\n` +
            `\n` +
            `Warm regards.`;

        const waMessage = encodeURIComponent(rawMessage);
        const waLink = `https://wa.me/971586947755?text=${waMessage}`;

        // --- Header ---
        const headerHeight = 28; // Reduced height

        // Top colored bar (Brown)
        doc.setFillColor(...brandBrown);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        // Logo (White) inside header
        if (logo) {
            doc.addImage(logo, 'PNG', margin, 9, 42, 42 * (150 / 500)); // Increased size & width, moved down to 9
        } else {
            doc.setFontSize(18);
            doc.setTextColor(255, 255, 255);
            doc.text('PAWPATHS', margin, 18);
        }

        // Company Details (Top Right) - White Text inside Header
        doc.setFontSize(8); // Slightly smaller
        doc.setTextColor(255, 255, 255);
        // Compact spacing to fit 4 lines
        doc.text('Pawpaths Pet Relocation Services', pageWidth - margin, 8, { align: 'right' });
        doc.text('Dubai, United Arab Emirates', pageWidth - margin, 11.5, { align: 'right' });
        doc.text('www.pawpathsae.com', pageWidth - margin, 15, { align: 'right' });

        // WhatsApp Line in Header (Icon + Number)
        const waNumber = '+971 58 694 7755';
        const waNumWidth = doc.getTextWidth(waNumber);
        const waIconSize = 3.5;
        const waY = 18.5;
        const waX = pageWidth - margin - waNumWidth;

        // Draw Icon
        if (waIcon) {
            doc.addImage(waIcon, 'PNG', waX - waIconSize - 1, waY - 2.5, waIconSize, waIconSize);
            doc.link(waX - waIconSize - 1, waY - 2.5, waIconSize, waIconSize, { url: waLink });
        }

        // Draw Number
        doc.text(waNumber, pageWidth - margin, waY, { align: 'right' });
        doc.link(waX, waY - 3, waNumWidth, 4, { url: waLink });

        // Title & Reference - Below Header
        doc.setFontSize(16);
        doc.setTextColor(...brandBrown);
        doc.text('Enquiry Details', margin, headerHeight + 12);

        doc.setFontSize(10);
        doc.setTextColor(...brandOrange);
        doc.text(`Ref: #${bookingReference || 'PENDING'}`, margin, headerHeight + 18);

        doc.setTextColor(120);
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, headerHeight + 18, { align: 'right' });

        // Divider
        doc.setDrawColor(...brandBrown);
        doc.setLineWidth(0.5);
        doc.line(margin, headerHeight + 22, pageWidth - margin, headerHeight + 22);

        let currentY = headerHeight + 28;

        // --- Section Helper ---
        const addSectionTitle = (title, y) => {
            doc.setFillColor(...brandOrange); // Orange Bullet
            doc.rect(margin, y, 2.5, 6, 'F');
            doc.setFontSize(11);
            doc.setTextColor(...brandOrange); // Orange Title
            doc.setFont(undefined, 'bold');
            doc.text(title, margin + 5, y + 4.5);
            doc.setFont(undefined, 'normal');
            return y + 8;
        };

        // 1. Customer Details
        currentY = addSectionTitle('Customer Information', currentY);

        autoTable(doc, {
            startY: currentY,
            head: [['Full Name', 'Email', 'Phone', 'City']],
            body: [[
                contactInfo.fullName,
                contactInfo.email,
                contactInfo.phone,
                contactInfo.city || '-'
            ]],
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2, textColor: 50 }, // Compact
            headStyles: { fillColor: brandOrange, textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 }, // Orange Header
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 60 },
                2: { cellWidth: 40 }
            },
            margin: { left: margin, right: margin }
        });

        currentY = doc.lastAutoTable.finalY + 6; // Reduced gap

        // 2. Travel Details
        currentY = addSectionTitle('Travel Itinerary', currentY);

        autoTable(doc, {
            startY: currentY,
            head: [['Origin', 'Destination', 'Travel Date', 'Transport Mode']],
            body: [[
                getCountryLabel(travelDetails.originCountry),
                getCountryLabel(travelDetails.destinationCountry),
                formatDate(travelDetails.travelDate),
                travelDetails.transportMode ? travelDetails.transportMode.replace(/_/g, ' ').toUpperCase() : 'MANIFEST CARGO'
            ]],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2, textColor: 50, lineColor: [230, 230, 230] },
            headStyles: { fillColor: brandOrange, textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2 },
            margin: { left: margin, right: margin }
        });

        currentY = doc.lastAutoTable.finalY + 6; // Reduced gap

        // 3. Pets
        currentY = addSectionTitle(`Pets (${pets.length})`, currentY);

        const petRows = pets.map((p, i) => [
            i + 1,
            p.name,
            `${p.speciesName || getSpeciesName(p.species_id)} / ${p.breedName || getBreedName(p.breed_id)}`,
            `${p.age} ${p.ageUnit || 'yrs'} / ${p.gender}`,
            `${p.weight} kg`
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['#', 'Name', 'Type / Breed', 'Age / Gender', 'Weight']],
            body: petRows,
            theme: 'striped',
            styles: { fontSize: 9, cellPadding: 2, valign: 'middle' },
            headStyles: { fillColor: brandOrange, textColor: 255, fontSize: 9, cellPadding: 2 },
            alternateRowStyles: { fillColor: lightBg },
            margin: { left: margin, right: margin }
        });

        currentY = doc.lastAutoTable.finalY + 6; // Reduced gap

        // 4. Services
        if (formData.servicesData && formData.servicesData.length > 0) {
            currentY = addSectionTitle('Selected Services', currentY);

            const serviceRows = formData.servicesData.map(s => [
                s.name,
                ''
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [['Service Name', '']],
                body: serviceRows,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: brandOrange, textColor: 255, fontStyle: 'bold', fontSize: 9, cellPadding: 2, halign: 'left' }, // Default left
                columnStyles: {
                    1: { halign: 'right', fontStyle: 'bold', textColor: brandBrown, cellWidth: 40 }
                },
                didParseCell: function (data) {
                    if (data.section === 'head' && data.column.index === 1) {
                        data.cell.styles.halign = 'right';
                    }
                },
                margin: { left: margin, right: margin }
            });

            currentY = doc.lastAutoTable.finalY + 6; // Reduced gap
        }

        // Total Box
        const totalAmount = calculateTotal();
        const totalWithTax = totalAmount * 1.05;
        const boxHeight = 26; // Compact height
        const totalBoxWidth = 70;
        const totalBoxX = pageWidth - margin - totalBoxWidth; // Aligned to right margin

        // Ensure we don't hit the footer
        if (currentY + boxHeight > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
        }

        const boxTop = currentY;

        // --- Disclaimer Box (Left) ---
        const disclaimerBoxWidth = totalBoxX - margin - 5; // Width from left margin to total box (minus small gap)

        // Background & Border for Disclaimer
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]); // Light BG
        doc.roundedRect(margin, boxTop, disclaimerBoxWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(...brandBrown);
        doc.setLineWidth(0.1); // Hairline border
        doc.roundedRect(margin, boxTop, disclaimerBoxWidth, boxHeight, 2, 2, 'S');

        // Disclaimer Text
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100);
        const disclaimer = "This preliminary estimate includes all selected services and applicable taxes. Final pricing may vary based on route availability, pet dimensions, destination country regulations, and documentation requirements.";

        // Calculate text fit
        const textPadding = 3;
        const splitDisclaimer = doc.splitTextToSize(disclaimer, disclaimerBoxWidth - (textPadding * 2));
        doc.text(splitDisclaimer, margin + textPadding, boxTop + 5); // Adjusted Y for padding


        // --- Total Estimate Box (Right) ---
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.roundedRect(totalBoxX, boxTop, totalBoxWidth, boxHeight, 2, 2, 'F');
        doc.setDrawColor(...brandBrown);
        doc.setLineWidth(0.1);
        doc.roundedRect(totalBoxX, boxTop, totalBoxWidth, boxHeight, 2, 2, 'S');

        // Totals
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont(undefined, 'bold'); // Bold Subtotal & Tax

        doc.text('Subtotal:', totalBoxX + 7, boxTop + 7);
        // doc.text(formatCurrency(totalAmount), pageWidth - margin - 5, boxTop + 7, { align: 'right' });

        doc.text('Tax (5%):', totalBoxX + 7, boxTop + 13);
        // doc.text(formatCurrency(totalAmount * 0.05), pageWidth - margin - 5, boxTop + 13, { align: 'right' });

        doc.setFontSize(11);
        doc.setTextColor(...brandBrown);
        doc.setFont(undefined, 'bold');
        doc.text('Total Estimate:', totalBoxX + 7, boxTop + 21);
        doc.setTextColor(...brandOrange);
        // doc.text(formatCurrency(totalWithTax), pageWidth - margin - 5, boxTop + 21, { align: 'right' });



        // Footer - Colored Bar
        const footerHeight = 12;
        const footerY = pageHeight - footerHeight;

        doc.setFillColor(...brandOrange);
        doc.rect(0, footerY, pageWidth, footerHeight, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        // Footer Text with Icon
        const footerText1 = 'Pawpaths Pet Relocation Services | www.pawpathsae.com | ';
        const footerTextWidth = doc.getTextWidth(footerText1);

        doc.text(footerText1, margin, footerY + 8);

        // Footer Icon & Number
        const footerWaX = margin + footerTextWidth;
        if (waIcon) {
            doc.addImage(waIcon, 'PNG', footerWaX, footerY + 5.5, 3.5, 3.5);
            doc.link(footerWaX, footerY + 5.5, 3.5, 3.5, { url: waLink });
        }

        doc.text(waNumber, footerWaX + 5, footerY + 8);
        doc.link(footerWaX + 5, footerY + 5, doc.getTextWidth(waNumber), 4, { url: waLink });
        doc.text('Page 1 of 1', pageWidth - margin, footerY + 8, { align: 'right' });

        doc.save(`Pawpaths_Booking_${bookingReference || 'Enquiry'}.pdf`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12">

            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-system-color-02/15 rounded-full flex items-center justify-center animate-bounce-slow shadow-sm">
                        <CheckCircle className="w-12 h-12 text-system-color-02" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-system-color-02">Enquiry Received Successfully!</h2>
                    <p className="text-brand-text-02 text-sm max-w-2xl mx-auto">
                        Thank you for trusting Pawpaths with your pet&apos;s journey! We&apos;ve received all the details and sent a confirmation to <span className="font-semibold text-brand-color-01">{contactInfo?.email}</span>. One of our relocation specialists will reach out to you shortly to discuss your requirements, verify the information, and prepare a customized quote for you.
                    </p>

                </div>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-level-1 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-brand-color-01/10 flex justify-between items-center">
                    <h3 className="text-brand-color-01 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <FileText size={20} className="text-brand-color-01" />
                        </div>
                        Enquiry Summary
                    </h3>
                    <span className="text-xl font-bold text-brand-color-01 font-mono bg-white/80 px-6 py-2 rounded-full border border-brand-color-01/20 shadow-sm">
                        {bookingReference ? `#${bookingReference}` : 'Processing...'}
                    </span>
                </div>

                <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 1. Journey Details (Customer + Travel) - Span 7 */}
                        <div className="lg:col-span-7 flex flex-col rounded-3xl border border-brand-color-01/10 overflow-hidden shadow-sm">
                            {/* Customer Section */}
                            <div className="bg-brand-color-02/10 p-6 border-b border-brand-color-01/5">
                                <h4 className="text-accent uppercase tracking-wider mb-4 flex items-center gap-2 text-sm font-bold">
                                    <div className="p-1.5 bg-accent/10 rounded-lg">
                                        <User size={16} />
                                    </div>
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/60 p-3 rounded-xl border border-brand-color-02/20">
                                        <p className="text-[10px] font-bold text-accent uppercase mb-0.5">Full Name</p>
                                        <p className="font-bold text-brand-text-02 text-base">{contactInfo?.fullName}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-xl border border-brand-color-02/20">
                                        <p className="text-[10px] font-bold text-accent uppercase mb-0.5">City / Place</p>
                                        <p className="font-bold text-brand-text-02 text-base">{contactInfo?.city || '-'}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-xl border border-brand-color-02/20">
                                        <p className="text-[10px] font-bold text-accent uppercase mb-0.5">Phone Number</p>
                                        <p className="font-bold text-brand-text-02 text-base">{contactInfo?.phone}</p>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-xl border border-brand-color-02/20">
                                        <p className="text-[10px] font-bold text-accent uppercase mb-0.5">Email Address</p>
                                        <p className="font-bold text-brand-text-02 text-base truncate" title={contactInfo?.email}>{contactInfo?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Travel Section */}
                            <div className="bg-system-color-03/5 p-6 flex-grow flex flex-col justify-center">
                                <h4 className="text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm font-bold">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <MapPin size={16} />
                                    </div>
                                    Travel Itinerary
                                </h4>
                                <div className="bg-white/60 p-5 rounded-2xl border border-blue-100 shadow-sm">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="text-center md:text-left flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Origin</p>
                                            <p className="font-bold text-brand-text-02 text-lg leading-tight">{getCountryLabel(travelDetails.originCountry)}</p>
                                            <p className="text-xs text-brand-text-02/70 mt-0.5 font-medium truncate">{travelDetails.originAirport || 'Airport not specified'}</p>
                                        </div>

                                        <div className="flex flex-col items-center justify-center w-full md:w-auto px-4">
                                            <div className="flex items-center gap-2 w-full md:w-32">
                                                <div className="h-[2px] flex-1 bg-blue-200"></div>
                                                <div className="p-2 bg-white rounded-full border border-blue-200 text-blue-600 shadow-sm">
                                                    {((travelDetails.originCountry === 'AE' || travelDetails.originCountry === 'United Arab Emirates') &&
                                                        (travelDetails.destinationCountry === 'AE' || travelDetails.destinationCountry === 'United Arab Emirates')) ? (
                                                        <Truck size={20} />
                                                    ) : (
                                                        (travelDetails.destinationCountry === 'AE' || travelDetails.destinationCountry === 'United Arab Emirates') ? (
                                                            <PlaneLanding size={20} />
                                                        ) : (
                                                            <PlaneTakeoff size={20} />
                                                        )
                                                    )}
                                                </div>
                                                <div className="h-[2px] flex-1 bg-blue-200"></div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                                <Calendar size={12} />
                                                {travelDetails.travelDate ? new Date(travelDetails.travelDate).toLocaleDateString('en-GB') : 'TBD'}
                                            </div>
                                        </div>

                                        <div className="text-center md:text-right flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Destination</p>
                                            <p className="font-bold text-brand-text-02 text-lg leading-tight">{getCountryLabel(travelDetails.destinationCountry)}</p>
                                            <p className="text-xs text-brand-text-02/70 mt-0.5 font-medium truncate">{travelDetails.destinationAirport || 'Airport not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Pets - Span 5 */}
                        <div className="lg:col-span-5 bg-brand-text-03/5 rounded-3xl border border-brand-text-03/20 p-6 h-full flex flex-col shadow-sm">
                            <h4 className="text-brand-text-03 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm font-bold">
                                <div className="p-1.5 bg-brand-text-03/10 rounded-lg">
                                    <Dog size={16} />
                                </div>
                                Pets ({pets.length})
                            </h4>
                            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar space-y-3 max-h-[500px]">
                                {pets.map((pet, idx) => (
                                    <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-brand-text-03/10 hover:border-brand-text-03/30 hover:shadow-md transition-all duration-300 group">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-text-03/20 to-brand-text-03/5 text-brand-text-03 flex items-center justify-center text-base font-bold shrink-0 shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-brand-text-02 text-base leading-tight truncate">{pet.name}</p>
                                                <p className="text-[10px] text-brand-text-02/80 font-bold uppercase tracking-wide mt-0.5 truncate">
                                                    {pet.speciesName || getSpeciesName(pet.species_id)} • {pet.breedName || getBreedName(pet.breed_id)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center p-1.5 bg-brand-text-02/5 rounded-lg border border-brand-text-02/10">
                                                <span className="block text-brand-text-02/60 text-[9px] uppercase font-bold">Age</span>
                                                <span className="font-bold text-brand-text-02 text-xs">{pet.age} {pet.ageUnit || 'yrs'}</span>
                                            </div>
                                            <div className="text-center p-1.5 bg-brand-text-02/5 rounded-lg border border-brand-text-02/10">
                                                <span className="block text-brand-text-02/60 text-[9px] uppercase font-bold">Gender</span>
                                                <span className="font-bold text-brand-text-02 text-xs truncate">{pet.gender}</span>
                                            </div>
                                            <div className="text-center p-1.5 bg-brand-text-02/5 rounded-lg border border-brand-text-02/10">
                                                <span className="block text-brand-text-02/60 text-[9px] uppercase font-bold">Weight</span>
                                                <span className="font-bold text-brand-text-02 text-xs">{pet.weight} kg</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


            </div>


            {/* Actions */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-level-1 space-y-6">
                <h3 className="text-brand-text-02 text-center mb-4">What would you like to do next?</h3>

                <div className="flex flex-col gap-4 max-w-md mx-auto">
                    {/* 1. WhatsApp (Primary) */}
                    <Button
                        onClick={handleWhatsApp}
                        className="w-full h-14 text-lg font-bold flex items-center justify-center gap-3 bg-system-color-02 hover:bg-system-color-02/90 text-white shadow-glow-success hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 rounded-xl"
                    >
                        <MessageCircle size={24} />
                        Send a WhatsApp Notification
                    </Button>

                    {/* 2. Download PDF (Secondary) */}
                    <Button
                        onClick={handleDownloadPDF}
                        className="w-full h-14 text-lg font-bold flex items-center justify-center gap-3 bg-brand-color-03 hover:bg-brand-color-03/90 text-white shadow-glow-accent hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 rounded-xl"
                    >
                        <FileDown size={24} />
                        Download Enquiry Details PDF
                    </Button>

                    {/* 3. Book Another Pet (Tertiary) */}
                    <Button
                        onClick={handleClose}
                        className="w-full h-14 text-lg font-bold flex items-center justify-center gap-3 bg-brand-color-01 hover:bg-brand-color-01/90 text-white shadow-level-3 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 rounded-xl"
                    >
                        <LogOut size={24} />
                        Thank You, Visit Pawpaths
                    </Button>
                </div>
            </div>

            <div className="pt-4 text-center">
                <button
                    onClick={handleLogout}
                    className="text-brand-text-02/60 hover:text-brand-text-02 flex items-center gap-2 mx-auto transition-colors text-sm font-medium"
                >
                    <LogOut size={16} />
                    Return to Home
                </button>
            </div>
        </div >
    );
}
