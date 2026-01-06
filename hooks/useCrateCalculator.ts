import { useState, useMemo } from 'react';

export interface PetMeasurements {
    lengthA: number; // Nose to root of tail
    elbowB: number;  // Ground to elbow
    widthC: number;  // Shoulder width
    heightD: number; // Ground to top of head/ear
    isSnubNosed: boolean;
}

export interface CrateResult {
    minInternalDims: {
        length: number;
        width: number;
        height: number;
    };
    recommendedCrate: {
        id: string;
        name: string;
        intL: number;
        intW: number;
        intH: number;
    } | null;
    isCustomBuildNeeded: boolean;
}

const CRATES = [
    { id: 'sky-100', name: 'Small (Series 100)', intL: 48, intW: 32, intH: 36 },
    { id: 'sky-200', name: 'Medium (Series 200)', intL: 66, intW: 46, intH: 48 },
    { id: 'sky-300', name: 'Intermediate (Series 300)', intL: 77, intW: 51, intH: 54 }, // Added based on typical gap
    { id: 'sky-400', name: 'Large (Series 400)', intL: 86, intW: 56, intH: 61 },
    { id: 'sky-500', name: 'XL (Series 500)', intL: 94, intW: 64, intH: 71 },
    { id: 'sky-700', name: 'Giant (Series 700)', intL: 114, intW: 73, intH: 81 }, // Added Giant
];

export function useCrateCalculator(measurements: PetMeasurements) {
    const result: CrateResult | null = useMemo(() => {
        const { lengthA, elbowB, widthC, heightD, isSnubNosed } = measurements;

        // Validate inputs
        if (lengthA <= 0 || elbowB <= 0 || widthC <= 0 || heightD <= 0) {
            return null;
        }

        // 1. Calculate Strict IATA Internal Dimensions
        // Formula: A + (0.5 * B)
        let calcLength = lengthA + (0.5 * elbowB);
        // Formula: C * 2
        let calcWidth = widthC * 2;
        // Formula: D + 3cm (Bedding clearance)
        let calcHeight = heightD + 3;

        // 2. Apply Snub-Nosed Modifier (+10%)
        if (isSnubNosed) {
            calcLength *= 1.1;
            calcWidth *= 1.1;
            calcHeight *= 1.1;
        }

        // Round up to nearest integer for safety
        const minInternalDims = {
            length: Math.ceil(calcLength),
            width: Math.ceil(calcWidth),
            height: Math.ceil(calcHeight),
        };

        // 3. Inventory Matcher (Best Fit Logic)
        // Find smallest crate where Crate > Calc
        const recommendedCrate = CRATES.find(crate =>
            crate.intL >= minInternalDims.length &&
            crate.intW >= minInternalDims.width &&
            crate.intH >= minInternalDims.height
        ) || null;

        const isCustomBuildNeeded = !recommendedCrate;

        return {
            minInternalDims,
            recommendedCrate,
            isCustomBuildNeeded
        };

    }, [measurements]);

    return result;
}
