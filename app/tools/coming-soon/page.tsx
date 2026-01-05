import React from 'react';
import ToolComingSoon from '@/components/tools/ToolComingSoon';

export default function GenericComingSoonPage({ searchParams }: { searchParams: { tool?: string } }) {
    const toolMap: Record<string, { title: string, description: string, iconName: string }> = {
        'breed-id': {
            title: 'AI Breed Scanner',
            description: 'AI-powered scan to identify breeds for accurate paperwork and ban checks.',
            iconName: 'ScanFace'
        },
        'photo': {
            title: 'Pet Passport Photo Maker',
            description: 'Crop and format your pet\'s photo to meet official airline and customs standards.',
            iconName: 'Crop'
        }
    };

    const tool = searchParams.tool && toolMap[searchParams.tool] ? toolMap[searchParams.tool] : {
        title: 'Coming Soon',
        description: 'This tool is currently under development.',
        iconName: 'Construction'
    };

    return <ToolComingSoon title={tool.title} description={tool.description} iconName={tool.iconName} />;
}
