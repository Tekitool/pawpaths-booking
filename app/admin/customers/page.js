import { Suspense } from 'react';
import { getCustomers } from '@/lib/actions/customer-actions';
import PageShell from '@/components/ui/PageShell';
import CustomerTable from '@/components/admin/CustomerTable';
import { Plus, Search, Filter } from 'lucide-react';

function TableSkeleton() {
    return (
        <div className="w-full h-96 bg-white/40 rounded-xl animate-pulse" />
    );
}

async function CustomerList() {
    const customers = await getCustomers();
    return <CustomerTable customers={customers || []} />;
}

export default function CustomersPage() {
    return (
        <PageShell
            title="Customer Directory"
            subtitle="Manage your client relationships"
            actions={
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent transition-colors shadow-sm font-medium text-sm">
                    <Plus size={16} /> Add Customer
                </button>
            }
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-02/60" size={18} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="w-full pl-10 pr-4 py-2 bg-white/50 border border-brand-text-02/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                </div>
                <button className="p-2 bg-white border border-brand-text-02/20 rounded-lg text-brand-text-02/80 hover:text-accent transition-colors">
                    <Filter size={18} />
                </button>
            </div>

            <Suspense fallback={<TableSkeleton />}>
                <CustomerList />
            </Suspense>
        </PageShell>
    );
}
