import React from 'react';
import ToolComingSoon from '@/components/tools/ToolComingSoon';

export default function WeatherPage() {
    return (
        <ToolComingSoon
            title="Heat Risk Forecaster"
            description="Avoid flight rejections by predicting seasonal temperature embargoes."
            iconName="ThermometerSun"
        />
    );
}
