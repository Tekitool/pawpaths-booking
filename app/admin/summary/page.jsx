import React from 'react';
import SummaryHeader from '@/components/summary/SummaryHeader';
import ReceivablesSummary from '@/components/summary/ReceivablesSummary';
import SalesExpensesChart from '@/components/summary/SalesExpensesChart';
import ExpensesDonutCard from '@/components/summary/ExpensesDonutCard';
import ProjectsEmptyState from '@/components/summary/ProjectsEmptyState';
import FinancialTable from '@/components/summary/FinancialTable';

export default function SummaryPage() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <SummaryHeader />

            <div className="space-y-8">
                <ReceivablesSummary />

                <SalesExpensesChart />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-full">
                        <ProjectsEmptyState />
                    </div>
                    <div className="h-full">
                        <ExpensesDonutCard />
                    </div>
                </div>

                <FinancialTable />
            </div>
        </div>
    );
}
