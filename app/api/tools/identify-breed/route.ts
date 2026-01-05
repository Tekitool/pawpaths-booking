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

        // 2. Call OpenAI GPT-4o
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert Veterinary and Pet Travel Consultant. 
          Analyze the provided image of a pet. 
          
          Return a JSON object with the following fields:
          - breed_name: string (Best guess)
          - species: "Dog" | "Cat" (Identify if it is a dog or a cat)
          - confidence_score: number (0-100)
          - description: string (Short, engaging summary of the breed, max 2 sentences)
          - average_weight: string (e.g., "25 - 34 kg")
          - lifespan: string (e.g., "10 - 12 yrs")
          - fun_fact: string (One interesting fact)
          - is_brachycephalic: boolean (True for pugs, bulldogs, boxers, shih tzus, etc. prone to breathing issues)
          - is_banned_breed: boolean (True for Pitbull Terrier, Japanese Tosa, Dogo Argentino, Fila Brasileiro, etc. commonly banned for air travel)
          - is_pet: boolean (True if it looks like a dog or cat, False otherwise)

          If 'is_pet' is false, you can leave other fields empty or null.
          Ensure the output is valid JSON.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Identify this breed and check for travel restrictions." },
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
            max_tokens: 500,
            temperature: 0.2, // Low temperature for more deterministic results
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
