import { Suspense } from 'react';
import { getCustomers } from '@/lib/actions/customer-actions';
import PageShell from '@/components/ui/PageShell';
import CustomerTable from '@/components/admin/CustomerTable';
import Pagination from '@/components/ui/Pagination';
import { Plus, Search, Filter } from 'lucide-react';

const PAGE_SIZE = 15;

function TableSkeleton() {
    return (
        <div className="w-full h-96 bg-white/40 rounded-xl animate-pulse" />
    );
}

async function CustomerList({ page, query }) {
    const { data, total, totalPages } = await getCustomers({ page, pageSize: PAGE_SIZE, query });
    return (
        <>
            <CustomerTable customers={data} />
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
            />
        </>
    );
}

export default async function CustomersPage(props) {
    const searchParams = await props.searchParams;
    const page = Math.max(1, Number(searchParams?.page) || 1);
    const query = searchParams?.query || '';

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
                        defaultValue={query}
                        className="w-full pl-10 pr-4 py-2 bg-white/50 border border-brand-text-02/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                </div>
                <button className="p-2 bg-white border border-brand-text-02/20 rounded-lg text-brand-text-02/80 hover:text-accent transition-colors">
                    <Filter size={18} />
                </button>
            </div>

            <Suspense fallback={<TableSkeleton />}>
                <CustomerList page={page} query={query} />
            </Suspense>
        </PageShell>
    );
}
