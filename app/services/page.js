import { getServiceCatalog } from '@/lib/actions/service-actions';
import { Box, Truck, Plane, FileText, Check, Info } from 'lucide-react';
import ElegantFooter from '@/components/ui/ElegantFooter';

// Icon mapping helper
const getIcon = (iconName) => {
    const icons = {
        'Truck': Truck,
        'Plane': Plane,
        'FileText': FileText,
        'Box': Box,
        // Add more as needed based on DB values
    };
    const Icon = icons[iconName] || Box;
    return <Icon className="w-6 h-6" />;
};

export default async function ServicesPage() {
    const services = await getServiceCatalog();

    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
        const catName = service.category?.name || 'Other Services';
        if (!acc[catName]) {
            acc[catName] = {
                details: service.category,
                items: []
            };
        }
        acc[catName].items.push(service);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-brand-text-02/5 font-sans">
            {/* Hero Section */}
            <div className="bg-brand-color-01 text-white py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="mb-6">
                        Our Premium Services
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                        Comprehensive pet relocation solutions tailored to your needs. From documentation to door-to-door delivery.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
                {Object.entries(groupedServices).map(([categoryName, group], idx) => (
                    <div key={idx} className="space-y-8">
                        {/* Category Header */}
                        <div className="flex items-center gap-4 border-b border-brand-text-02/20 pb-4">
                            <div className="p-3 bg-accent/15 text-accent rounded-2xl">
                                {getIcon(group.details?.icon)}
                            </div>
                            <h2 className="text-brand-text-02">{categoryName}</h2>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {group.items.map((service) => (
                                <div key={service.id} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-text-02/20 group flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-brand-text-02/5 rounded-2xl text-brand-color-01 group-hover:bg-brand-color-01 group-hover:text-white transition-colors duration-300">
                                            {getIcon(service.icon)}
                                        </div>
                                        {service.is_mandatory && (
                                            <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full uppercase tracking-wider border border-system-color-01">
                                                Mandatory
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-gray-900 mb-3 group-hover:text-accent transition-colors">
                                        {service.name}
                                    </h3>

                                    <p className="text-brand-text-02/80 leading-relaxed mb-6 flex-grow">
                                        {service.short_desc || service.shortDescription || "No description available."}
                                    </p>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-brand-text-02/60 uppercase font-bold tracking-wider">Starting from</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {service.base_price?.toLocaleString() || service.baseCost?.toLocaleString() || 0}
                                                </span>
                                                <span className="text-sm font-medium text-brand-text-02/80">AED</span>
                                            </div>
                                        </div>

                                        {service.pricing_model && (
                                            <span className="px-3 py-1 bg-brand-text-02/10 text-brand-text-02 text-xs font-medium rounded-lg">
                                                {service.pricing_model.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(groupedServices).length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-block p-6 bg-brand-text-02/5 rounded-full mb-4">
                            <Box className="w-12 h-12 text-brand-text-02/60" />
                        </div>
                        <h3 className="text-gray-900 mb-2">No Services Found</h3>
                        <p className="text-brand-text-02/80">Check back later for our updated service catalog.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
