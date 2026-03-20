'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRAND_COLORS } from '@/lib/theme-config';

// ── Helpers ────────────────────────────────────────────────────────────────

function loadImage(src) {
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
}

function formatCurrency(amount, currency = 'AED') {
    return `${currency} ${Number(amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB');
}

// ── Shared Layout ──────────────────────────────────────────────────────────

async function drawHeader(doc, title, docNumber) {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const brandBrown = BRAND_COLORS.brand01.rgb;
    const headerHeight = 28;

    // Header bar
    doc.setFillColor(...brandBrown);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Logo
    const logo = await loadImage('/pplogo-white.svg');
    if (logo) {
        doc.addImage(logo, 'PNG', margin, 9, 42, 42 * (150 / 500));
    } else {
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('PAWPATHS', margin, 18);
    }

    // Company details
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Pawpaths Pet Relocation Services', pageWidth - margin, 8, { align: 'right' });
    doc.text('Dubai, United Arab Emirates', pageWidth - margin, 11.5, { align: 'right' });
    doc.text('www.pawpathsae.com', pageWidth - margin, 15, { align: 'right' });
    doc.text('+971 58 694 7755', pageWidth - margin, 18.5, { align: 'right' });

    // Title & doc number
    let y = headerHeight + 10;
    doc.setFontSize(16);
    doc.setTextColor(...brandBrown);
    doc.text(title, margin, y);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(docNumber, pageWidth - margin, y, { align: 'right' });

    return y + 8;
}

function drawCustomerBlock(doc, entity, docData, startY) {
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let y = startY;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    // Left: customer info
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', margin, y);
    doc.setFont(undefined, 'normal');
    y += 5;
    doc.text(entity?.display_name || 'N/A', margin, y);
    y += 4;
    const email = entity?.contact_info?.email;
    if (email) {
        doc.text(email, margin, y);
        y += 4;
    }
    const phone = entity?.contact_info?.phone;
    if (phone) {
        doc.text(phone, margin, y);
        y += 4;
    }

    // Right: dates
    const rightX = pageWidth - margin;
    let ry = startY;
    doc.setFont(undefined, 'bold');
    doc.text('Date:', rightX - 40, ry);
    doc.setFont(undefined, 'normal');
    doc.text(formatDate(docData.issue_date), rightX, ry, { align: 'right' });
    ry += 5;

    if (docData.due_date) {
        doc.setFont(undefined, 'bold');
        doc.text('Due Date:', rightX - 40, ry);
        doc.setFont(undefined, 'normal');
        doc.text(formatDate(docData.due_date), rightX, ry, { align: 'right' });
        ry += 5;
    }

    doc.setFont(undefined, 'bold');
    doc.text('Currency:', rightX - 40, ry);
    doc.setFont(undefined, 'normal');
    doc.text(docData.currency || 'AED', rightX, ry, { align: 'right' });

    return Math.max(y, ry) + 6;
}

function drawItemsTable(doc, items, startY, currency = 'AED') {
    const margin = 15;
    const brandBrown = BRAND_COLORS.brand01.rgb;

    const tableData = items.map((item, i) => [
        i + 1,
        item.description || '',
        Number(item.quantity || 0).toFixed(2),
        formatCurrency(item.unit_price, currency),
        `${Number(item.tax_rate || 0).toFixed(0)}%`,
        formatCurrency(Number(item.quantity || 0) * Number(item.unit_price || 0), currency),
    ]);

    autoTable(doc, {
        startY,
        margin: { left: margin, right: margin },
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Tax', 'Amount']],
        body: tableData,
        headStyles: {
            fillColor: brandBrown,
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
        },
        bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20, halign: 'right' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 32, halign: 'right' },
        },
        alternateRowStyles: { fillColor: [250, 248, 245] },
    });

    return doc.lastAutoTable.finalY + 6;
}

function drawTotals(doc, docData, startY) {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const currency = docData.currency || 'AED';
    let y = startY;

    const rightX = pageWidth - margin;
    const labelX = rightX - 60;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    doc.text('Subtotal:', labelX, y);
    doc.text(formatCurrency(docData.subtotal, currency), rightX, y, { align: 'right' });
    y += 5;

    doc.text('Tax:', labelX, y);
    doc.text(formatCurrency(docData.tax_total, currency), rightX, y, { align: 'right' });
    y += 6;

    // Grand total line
    doc.setDrawColor(200, 200, 200);
    doc.line(labelX, y - 2, rightX, y - 2);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...BRAND_COLORS.brand01.rgb);
    doc.text('Total:', labelX, y + 2);
    doc.text(formatCurrency(docData.grand_total, currency), rightX, y + 2, { align: 'right' });

    return y + 12;
}

function drawFooter(doc) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Pawpaths Pet Relocation Services', pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, margin, pageHeight - 8);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate and download a Quote PDF.
 */
export async function generateQuotePDF(docData, items, entity) {
    const doc = new jsPDF();
    let y = await drawHeader(doc, 'QUOTATION', docData.doc_number || 'DRAFT');
    y = drawCustomerBlock(doc, entity, docData, y);
    y = drawItemsTable(doc, items, y, docData.currency);
    y = drawTotals(doc, docData, y);

    // Notes
    if (docData.notes) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'bold');
        doc.text('Notes:', 15, y);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(docData.notes, 120);
        doc.text(lines, 15, y + 4);
    }

    drawFooter(doc);
    doc.save(`${docData.doc_number || 'Quote'}.pdf`);
}

/**
 * Generate and download an Invoice PDF.
 */
export async function generateInvoicePDF(docData, items, entity) {
    const doc = new jsPDF();
    let y = await drawHeader(doc, 'INVOICE', docData.doc_number || 'DRAFT');
    y = drawCustomerBlock(doc, entity, docData, y);
    y = drawItemsTable(doc, items, y, docData.currency);
    y = drawTotals(doc, docData, y);

    // Payment info
    const paid = Number(docData.paid_amount || 0);
    const balance = Number(docData.balance_amount || docData.grand_total || 0);
    if (paid > 0) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const pageWidth = doc.internal.pageSize.width;
        const rightX = pageWidth - 15;
        const labelX = rightX - 60;

        doc.text('Paid:', labelX, y);
        doc.text(formatCurrency(paid, docData.currency), rightX, y, { align: 'right' });
        y += 5;

        doc.setFont(undefined, 'bold');
        doc.text('Balance Due:', labelX, y);
        doc.text(formatCurrency(balance, docData.currency), rightX, y, { align: 'right' });
        y += 8;
    }

    drawFooter(doc);
    doc.save(`${docData.doc_number || 'Invoice'}.pdf`);
}
