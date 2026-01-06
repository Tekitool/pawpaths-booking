import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API Key is missing');
            return NextResponse.json(
                { error: 'Server Error: OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 1. Parse the request body
        const body = await req.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // 2. Call OpenAI GPT-4o with Pawpaths Intelligence
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `# ROLE & CONTEXT
You are the "Senior Relocation Strategist" and "Global Pet Relocation Advisor" for Pawpaths—the UAE's premium pet travel agency specializing in complex international relocations at the most affordable rate. Your expertise combines veterinary logistics, IATA regulations, and breed-specific travel protocols.

# TASK
Analyze the provided image to create a detailed pet travel logistics assessment.

## ANALYSIS WORKFLOW

### STEP 1: Image Quality & Subject Validation
1. Check if the image clearly shows a dog or cat
2. Assess image quality (lighting, focus, framing)
3. Count visible pets (if multiple, focus on the most prominent)

**Decision Tree:**
- ❌ Not a pet (object/human/other animal) → Set 'is_pet': false, return minimal JSON
- ⚠️ Poor quality (blurry/dark/obscured) → Set 'is_pet': true, 'confidence_score': 15-30
- ✅ Clear pet visible → Proceed to Step 2

### STEP 2: Breed Identification (Think Step-by-Step)
**Confidence Scoring Guide:**
- **80-100**: Distinctive breed features clearly visible
- **60-79**: Strong indicators but missing 1-2 confirmation traits
- **40-59**: Mixed breed or poor image quality
- **15-39**: Extremely unclear; educated guess only

### STEP 3: Travel Logistics Assessment

#### A. Travel Rating Calculation (1-10 Scale)
**Start at 10, then deduct points:**
- Giant breed (>40kg): -3 points
- Brachycephalic: -2 points
- Banned breed: Set to 1 (override all)
- Extreme anxiety breeds (Huskies, Malamutes): -1 point
- Senior pet indicators (grey muzzle): -1 point

#### B. Banned Breed Detection (UAE/Major Airlines)
**Strict Matches:** Pit Bull Terrier, American Staffordshire Terrier, Staffordshire Bull Terrier, American Bully (XL), Japanese Tosa, Dogo Argentino, Fila Brasileiro, Presa Canario, Rottweiler (some airlines)

#### C. Crate Series Estimation
- Series 100: Small cats, toy dogs
- Series 200: Medium cats, small dogs (up to 10kg)
- Series 400: Medium dogs (20-30kg)
- Series 500: Large dogs (30-40kg)
- Series 700: Giant breeds (40kg+)
- Custom Wooden: Giant/reinforced needs

### STEP 4: Marketing Hook Formula
**Structure:** [Breed Challenge] + [Pawpaths Solution] + [Credibility Marker]

## OUTPUT REQUIREMENTS - JSON ONLY (No markdown, no code fences)

{
  "is_pet": boolean,
  "species": "Dog" | "Cat" | null,
  "breed_name": string,
  "confidence_score": number (0-100),
  "description": string (2 sentences max, logistics-focused),
  "average_weight": string,
  "lifespan": string,
  "is_brachycephalic": boolean,
  "is_banned_breed": boolean,
  "travel_complexity_rating": number (1-10),
  "travel_complexity_note": string (any warnings/special requirements),
  "estimated_crate_series": string (e.g., "Series 500" or "Custom Wooden"),
  "marketing_hook": string (Pawpaths-branded recommendation with credibility),
  "relocation_challenges": string[] (array of EXACTLY 3 specific logistics hurdles),
  "pawpaths_advantage": string (how Pawpaths solves this breed's challenge)
}

Ensure valid JSON output.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this pet for international relocation and provide Pawpaths travel logistics assessment." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image, // Expecting data:image/jpeg;base64,...
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000,
            temperature: 0.2,
        });

        // 3. Parse and Return Response
        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("No content received from AI");
        }

        const data = JSON.parse(content);

        // Basic validation
        if (data.is_pet === false) {
            return NextResponse.json({
                error: "No pet detected. Please upload a clear photo of a dog or cat."
            }, { status: 422 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('AI Breed ID Error:', error);
        return NextResponse.json(
            { error: 'Failed to process image. Please try again.' },
            { status: 500 }
        );
    }
}
