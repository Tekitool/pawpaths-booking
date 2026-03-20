// app/admin/reports/page.jsx
import React, { Suspense } from 'react';
import { getReportData } from '@/lib/actions/report-actions';
import { getFinancialKPIs } from '@/lib/actions/finance-actions';
import DateRangeFilter from '@/components/reports/DateRangeFilter';
import ProfitLossChart from '@/components/reports/ProfitLossChart';
import RevenueOverTimeChart from '@/components/reports/RevenueOverTimeChart';
import InvoiceStatusBreakdown from '@/components/reports/InvoiceStatusBreakdown';
import TopCustomersChart from '@/components/reports/TopCustomersChart';
import ExportReportButton from '@/components/reports/ExportReportButton';
import ServicePerformanceChart from '@/components/reports/ServicePerformanceChart';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { getServiceRevenueBreakdown, getTopServicesByBookings, getServiceProfitMargins } from '@/lib/actions/service-analytics-actions';

function getDateRange(searchParams) {
    const preset = searchParams?.preset || 'this_year';
    const from = searchParams?.from;
    const to = searchParams?.to;

    if (from && to) return { from, to, preset };

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    switch (preset) {
        case 'this_month':
            return {
                from: new Date(y, m, 1).toISOString().split('T')[0],
                to: new Date(y, m + 1, 0).toISOString().split('T')[0],
                preset,
            };
        case 'last_month':
            return {
                from: new Date(y, m - 1, 1).toISOString().split('T')[0],
                to: new Date(y, m, 0).toISOString().split('T')[0],
                preset,
            };
        case 'this_quarter': {
            const qStart = Math.floor(m / 3) * 3;
            return {
                from: new Date(y, qStart, 1).toISOString().split('T')[0],
                to: new Date(y, qStart + 3, 0).toISOString().split('T')[0],
                preset,
            };
        }
        case 'last_quarter': {
            const qStart = Math.floor(m / 3) * 3 - 3;
            const qYear = qStart < 0 ? y - 1 : y;
            const qMonth = ((qStart % 12) + 12) % 12;
            return {
                from: new Date(qYear, qMonth, 1).toISOString().split('T')[0],
                to: new Date(qYear, qMonth + 3, 0).toISOString().split('T')[0],
                preset,
            };
        }
        case 'last_year':
            return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31`, preset };
        case 'this_year':
        default:
            return { from: `${y}-01-01`, to: `${y}-12-31`, preset: 'this_year' };
    }
}

function KPICard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white border border-brand-color-02 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={16} className="text-white" />
                </div>
                <span className="text-sm text-brand-text-02">{label}</span>
            </div>
            <span className="text-2xl font-bold text-brand-text-01">
                AED {Number(value || 0).toLocaleString()}
            </span>
        </div>
    );
}

export default async function ReportsPage({ searchParams }) {
    const params = await searchParams;
    const dateRange = getDateRange(params);

    const [reportResult, kpiResult, svcRevenueResult, svcBookingsResult, svcMarginsResult] = await Promise.all([
        getReportData({ from: dateRange.from, to: dateRange.to }),
        getFinancialKPIs(),
        getServiceRevenueBreakdown({ from: dateRange.from, to: dateRange.to }),
        getTopServicesByBookings({ from: dateRange.from, to: dateRange.to }),
        getServiceProfitMargins({ from: dateRange.from, to: dateRange.to }),
    ]);

    const report = reportResult.data || {
        revenueByCustomer: [],
        invoiceStatus: [],
        expensesByVendor: [],
        profitLoss: { months: [], totals: { revenue: 0, expenses: 0, netProfit: 0 } },
        expenseTypeSplit: [],
    };
    const kpis = kpiResult.data || {};

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text-01">Financial Reports</h1>
                    <p className="text-sm text-brand-text-02 mt-1">
                        {dateRange.from} — {dateRange.to}
                    </p>
                </div>
                <ExportReportButton reportData={report} dateRange={dateRange} />
            </div>

            {/* Date Range Filter */}
            <Suspense fallback={null}>
                <DateRangeFilter />
            </Suspense>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Revenue" value={kpis.totalRevenue} icon={TrendingUp} color="bg-system-color-03" />
                <KPICard label="Expenses" value={kpis.totalExpenses} icon={TrendingDown} color="bg-status-warning" />
                <KPICard
                    label="Net Profit"
                    value={kpis.netProfit}
                    icon={DollarSign}
                    color={kpis.netProfit >= 0 ? 'bg-status-success' : 'bg-status-error'}
                />
                <KPICard label="Outstanding" value={kpis.totalOutstanding} icon={AlertCircle} color="bg-system-color-02" />
            </div>

            {/* Profit & Loss (full width) */}
            <ProfitLossChart data={report.profitLoss} />

            {/* Revenue Over Time + Invoice Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueOverTimeChart data={report.profitLoss?.months || []} />
                </div>
                <div className="lg:col-span-1">
                    <InvoiceStatusBreakdown data={report.invoiceStatus} />
                </div>
            </div>

            {/* Top Customers + Expenses by Vendor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopCustomersChart data={report.revenueByCustomer} />
                <TopCustomersChart data={report.expensesByVendor} title="Top Vendors by Expenses" />
            </div>

            {/* Service Performance */}
            <ServicePerformanceChart
                revenueData={svcRevenueResult?.data || []}
                bookingData={svcBookingsResult?.data || []}
                marginData={svcMarginsResult?.data || []}
            />
        </div>
    );
}
