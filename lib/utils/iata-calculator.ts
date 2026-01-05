
export interface PetMeasurements {
    lengthA: number; // Nose to root of tail
    elbowB: number;  // Ground to elbow
    widthC: number;  // Shoulder width
    heightD: number; // Ground to top of head/ear
    isSnubNosed?: boolean;
}

export interface CrateRecommendation {
    minInternalDims: {
        length: number;
        width: number;
        height: number;
    };
    recommendedCrate: string;
    crateType: 'standard' | 'custom';
    seriesDims?: {
        length: number;
        width: number;
        height: number;
    };
}

const STANDARD_CRATES = [
    { name: 'Series 100 (Small)', length: 53, width: 40, height: 38 },
    { name: 'Series 200 (Medium)', length: 71, width: 52, height: 54 },
    { name: 'Series 300 (Intermediate)', length: 81, width: 57, height: 61 },
    { name: 'Series 400 (Large)', length: 91, width: 64, height: 69 },
    { name: 'Series 500 (X-Large)', length: 102, width: 69, height: 76 },
    { name: 'Series 700 (Giant)', length: 122, width: 81, height: 89 },
];

export function calculateCrateSize(measurements: PetMeasurements): CrateRecommendation {
    const { lengthA, elbowB, widthC, heightD, isSnubNosed } = measurements;

    // 1. Calculate Minimum Internal Dimensions (IATA Formula)
    // Round UP to nearest integer
    let minLength = Math.ceil(lengthA + (elbowB / 2));
    let minWidth = Math.ceil(widthC * 2);
    let minHeight = Math.ceil(heightD + 3);

    // Snub-nosed buffer (+10%)
    if (isSnubNosed) {
        minLength = Math.ceil(minLength * 1.1);
        minWidth = Math.ceil(minWidth * 1.1);
        minHeight = Math.ceil(minHeight * 1.1);
    }

    // 2. Find suitable standard crate
    let recommendedCrate = null;
    let crateType: 'standard' | 'custom' = 'custom';
    let seriesDims = undefined;

    for (const crate of STANDARD_CRATES) {
        // Check if pet fits within this crate's dimensions
        // Note: Crate dimensions are usually external, but for this calculation we compare against them as proxies for "Series" capacity.
        // In strict IATA, we'd check internal dims, but standard series mapping usually assumes these fit if calculated mins are smaller.
        // Let's assume the provided series dims are effectively the usable space or close enough for series selection logic.
        // Actually, strictly speaking, internal dims of plastic crates are smaller. 
        // However, for this "Series" recommender, we'll check if the calculated MINIMUMS fit within the Series dimensions.

        if (minLength <= crate.length && minWidth <= crate.width && minHeight <= crate.height) {
            recommendedCrate = crate.name;
            crateType = 'standard';
            seriesDims = { length: crate.length, width: crate.width, height: crate.height };
            break;
        }
    }

    if (!recommendedCrate) {
        recommendedCrate = 'Custom Wooden Crate Required';
        crateType = 'custom';
    }

    return {
        minInternalDims: {
            length: minLength,
            width: minWidth,
            height: minHeight
        },
        recommendedCrate,
        crateType,
        seriesDims
    };
}
