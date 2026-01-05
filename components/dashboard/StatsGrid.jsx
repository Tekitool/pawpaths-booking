import React from 'react';
import { FileText, Clock, Activity, CheckCircle } from 'lucide-react';

export default function StatsGrid({ stats }) {
    const items = [
        {
            label: 'Total Bookings',
            value: stats.total || 0,
            icon: FileText,
            // Light Blue Gradient
            gradientVar: 'var(--gradient-stats-blue)',
            iconBg: 'bg-white/60 text-info',
            borderColorVar: 'var(--border-stats-blue)'
        },
        {
            label: 'Pending',
            value: stats.pending || 0,
            icon: Clock,
            // Light Orange Gradient
            gradientVar: 'var(--gradient-stats-orange)',
            iconBg: 'bg-white/60 text-accent',
            borderColorVar: 'var(--border-stats-orange)'
        },
        {
            label: 'Active',
            value: stats.active || 0,
            icon: Activity,
            // Light Purple Gradient
            gradientVar: 'var(--gradient-stats-purple)',
            iconBg: 'bg-white/60 text-brand-text-03',
            borderColorVar: 'var(--border-stats-purple)'
        },
        {
            label: 'Completed',
            value: stats.completed || 0,
            icon: CheckCircle,
            // Light Green Gradient
            gradientVar: 'var(--gradient-stats-emerald)',
            iconBg: 'bg-white/60 text-emerald-600',
            borderColorVar: 'var(--border-stats-emerald)'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`
                        relative overflow-hidden
                        backdrop-blur-xl
                        border
                        rounded-3xl
                        p-6
                        shadow-level-1
                        hover:shadow-level-2
                        transition-all duration-300
                        group
                    `}
                    style={{
                        backgroundImage: item.gradientVar,
                        borderColor: item.borderColorVar
                    }}
                >
                    {/* Glass Reflection Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-brand-text-02/80 mb-1">{item.label}</p>
                            <h3 className="text-brand-text-02">{item.value}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm ${item.iconBg} transition-transform group-hover:scale-110 duration-300`}>
                            <item.icon size={24} strokeWidth={2} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
