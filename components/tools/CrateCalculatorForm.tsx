'use client';

import React, { useState } from 'react';
import { Ruler, Box, Info, Calculator } from 'lucide-react';
import WhatsAppShareBtn from '@/components/WhatsAppShareBtn';

export default function CrateCalculatorForm() {
    const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const l = parseFloat(dimensions.length);
        const w = parseFloat(dimensions.width);
        const h = parseFloat(dimensions.height);

        if (l && w && h) {
            // Placeholder logic: Volumetric weight (cm) / 6000
            const volWeight = (l * w * h) / 6000;
            setResult(parseFloat(volWeight.toFixed(2)));
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Ruler size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Dimensions</h2>
                </div>
                <p className="text-sm text-gray-500">
                    Enter the dimensions of your pet&apos;s crate in centimeters.
                </p>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                        <input
                            type="number"
                            value={dimensions.length}
                            onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                        <input
                            type="number"
                            value={dimensions.width}
                            onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                        <input
                            type="number"
                            value={dimensions.height}
                            onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Calculator size={20} />
                    Calculate Volumetric Weight
                </button>

                {result !== null && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 mb-2">
                            <Box className="text-orange-600" size={24} />
                            <span className="font-semibold text-gray-900">Estimated Volumetric Weight</span>
                        </div>
                        <div className="text-3xl font-bold text-orange-600">
                            {result} kg
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-start gap-2">
                            <Info size={16} className="mt-0.5 flex-shrink-0" />
                            This is an estimate based on standard IATA formulas (L x W x H / 6000). Actual chargeable weight may vary by airline.
                        </p>
                    </div>
                )}

                <div className="pt-6 border-t border-gray-100 flex justify-center">
                    <WhatsAppShareBtn
                        title="Crate Calculator Result"
                        text={result ? `I calculated a volumetric weight of ${result} kg for my pet's crate.` : "Check out this Crate Calculator!"}
                    />
                </div>
            </div>
        </div>
    );
}
