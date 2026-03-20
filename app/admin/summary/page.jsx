import React from 'react';
import SummaryHeader from '@/components/summary/SummaryHeader';
import ReceivablesSummary from '@/components/summary/ReceivablesSummary';
import SalesExpensesChart from '@/components/summary/SalesExpensesChart';
import ExpensesDonutCard from '@/components/summary/ExpensesDonutCard';
import ProjectsEmptyState from '@/components/summary/ProjectsEmptyState';
import FinancialTable from '@/components/summary/FinancialTable';
import {
    getReceivablesAging,
    getMonthlyRevExpData,
    getExpensesByCategory,
    getFinancialKPIs,
} from '@/lib/actions/finance-actions';

export default async function SummaryPage() {
    const currentYear = new Date().getFullYear();

    const [agingResult, monthlyResult, expensesResult, kpisResult] = await Promise.all([
        getReceivablesAging(),
        getMonthlyRevExpData(currentYear),
        getExpensesByCategory(),
        getFinancialKPIs(),
    ]);

    const agingData = agingResult.data || {};
    const monthlyData = monthlyResult.data || [];
    const expensesData = expensesResult.data || [];
    const kpis = kpisResult.data || {};

    const chartTotals = {
        totalSales: kpis.totalSales || 0,
        totalReceipts: kpis.totalReceipts || 0,
        totalExpenses: kpis.totalExpenses || 0,
    };

    // Build period breakdown rows for FinancialTable from KPIs
    const tableData = [
        { label: 'Today', sales: kpis.salesToday || 0, receipts: kpis.receiptsToday || 0, due: kpis.dueToday || 0 },
        { label: 'This Week', sales: kpis.salesWeek || 0, receipts: kpis.receiptsWeek || 0, due: kpis.dueWeek || 0 },
        { label: 'This Month', sales: kpis.salesMonth || 0, receipts: kpis.receiptsMonth || 0, due: kpis.dueMonth || 0 },
        { label: 'This Quarter', sales: kpis.salesQuarter || 0, receipts: kpis.receiptsQuarter || 0, due: kpis.dueQuarter || 0 },
        { label: 'This Year', sales: kpis.salesYear || 0, receipts: kpis.receiptsYear || 0, due: kpis.dueYear || 0 },
    ];

    return (
        <div className="max-w-[1600px] mx-auto">
            <SummaryHeader />

            <div className="space-y-8">
                <ReceivablesSummary data={agingData} />

                <SalesExpensesChart data={monthlyData} totals={chartTotals} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-full">
                        <ProjectsEmptyState />
                    </div>
                    <div className="h-full">
                        <ExpensesDonutCard data={expensesData} />
                    </div>
                </div>

                <FinancialTable data={tableData} />
            </div>
        </div>
    );
}
