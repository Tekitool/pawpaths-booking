// components/reports/ExportReportButton.jsx
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatCurrency(amount) {
    return `AED ${Number(amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function drawHeader(doc, dateRange) {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    // Header bar
    doc.setFillColor(101, 67, 33);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('PAWPATHS', margin, 18);

    doc.setFontSize(8);
    doc.text('Pawpaths Pet Relocation Services', pageWidth - margin, 10, { align: 'right' });
    doc.text('Dubai, United Arab Emirates', pageWidth - margin, 14, { align: 'right' });
    doc.text('+971 58 694 7755', pageWidth - margin, 18, { align: 'right' });

    let y = 38;
    doc.setFontSize(16);
    doc.setTextColor(101, 67, 33);
    doc.text('Financial Report', margin, y);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${dateRange.from} — ${dateRange.to}`, pageWidth - margin, y, { align: 'right' });

    return y + 12;
}

export default function ExportReportButton({ reportData, dateRange }) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            let y = drawHeader(doc, dateRange);

            // KPI Summary
            const totals = reportData.profitLoss?.totals || {};
            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50);
            doc.text('Summary', 15, y);
            y += 6;

            autoTable(doc, {
                startY: y,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Revenue', formatCurrency(totals.revenue)],
                    ['Total Expenses', formatCurrency(totals.expenses)],
                    ['Net Profit', formatCurrency(totals.netProfit)],
                ],
                theme: 'grid',
                headStyles: { fillColor: [101, 67, 33], textColor: 255 },
                styles: { fontSize: 9 },
                margin: { left: 15, right: 15 },
            });
            y = doc.lastAutoTable.finalY + 10;

            // Revenue by Customer
            if (reportData.revenueByCustomer?.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50);
                doc.text('Revenue by Customer', 15, y);
                y += 6;

                autoTable(doc, {
                    startY: y,
                    head: [['Customer', 'Invoices', 'Total']],
                    body: reportData.revenueByCustomer.map((c) => [
                        c.name,
                        String(c.count),
                        formatCurrency(c.total),
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [101, 67, 33], textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: 15, right: 15 },
                });
                y = doc.lastAutoTable.finalY + 10;
            }

            // Expenses by Vendor
            if (reportData.expensesByVendor?.length > 0) {
                if (y > 250) { doc.addPage(); y = 20; }

                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50);
                doc.text('Expenses by Vendor', 15, y);
                y += 6;

                autoTable(doc, {
                    startY: y,
                    head: [['Vendor', 'Count', 'Total']],
                    body: reportData.expensesByVendor.map((v) => [
                        v.name,
                        String(v.count),
                        formatCurrency(v.total),
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [101, 67, 33], textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: 15, right: 15 },
                });
                y = doc.lastAutoTable.finalY + 10;
            }

            // P&L Monthly
            const months = reportData.profitLoss?.months || [];
            if (months.length > 0) {
                if (y > 220) { doc.addPage(); y = 20; }

                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50);
                doc.text('Monthly Profit & Loss', 15, y);
                y += 6;

                autoTable(doc, {
                    startY: y,
                    head: [['Month', 'Revenue', 'Expenses', 'Net Profit']],
                    body: months.map((m) => [
                        m.name,
                        formatCurrency(m.revenue),
                        formatCurrency(m.expenses),
                        formatCurrency(m.netProfit),
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [101, 67, 33], textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: 15, right: 15 },
                });
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Generated on ${new Date().toLocaleDateString('en-GB')} — Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }

            doc.save(`Pawpaths-Report-${dateRange.from}-to-${dateRange.to}.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
    );
}
