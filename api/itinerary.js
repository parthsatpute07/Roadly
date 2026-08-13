// ======================================
// ROADLY AI ITINERARY API
// Vercel Serverless Function
// ======================================

export default async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed."
        });

    }

    try {

        const {
            start,
            destination,
            days,
            budget,
            interests
        } = req.body;


        // -------------------------------
        // Validate request
        // -------------------------------

        if (
            !start ||
            !destination ||
            !days
        ) {

            return res.status(400).json({
                error: "Missing trip information."
            });

        }


        // -------------------------------
        // Gemini API key
        // -------------------------------

        const GEMINI_API_KEY =
            process.env.GEMINI_API_KEY;


        if (!GEMINI_API_KEY) {

            return res.status(500).json({
                error: "Gemini API key is not configured."
            });

        }


        // -------------------------------
        // AI Prompt
        // -------------------------------

        const prompt = `
You are Roadly AI, an expert road-trip planner.

Create a practical, exciting and realistic road trip itinerary.

Starting Point:
${start}

Destination:
${destination}

Trip Duration:
${days} days

Estimated Budget:
₹${budget || "Not specified"}

Interests:
${interests || "Sightseeing, Food, Nature"}

Create a realistic ${days}-day road trip itinerary.

For every day include:

<h3>Day X</h3>

<h4>Morning</h4>
<p>...</p>

<h4>Afternoon</h4>
<p>...</p>

<h4>Evening</h4>
<p>...</p>

<h4>Main Attractions</h4>
<ul>
<li>...</li>
</ul>

<h4>Food Recommendations</h4>
<ul>
<li>...</li>
</ul>

<h4>Suggested Hotel Area</h4>
<p>...</p>

<h4>Travel Timing</h4>
<p>...</p>

<h4>Fuel / Refreshment Breaks</h4>
<p>...</p>

<h4>Budget Tips</h4>
<ul>
<li>...</li>
</ul>

Important rules:

- Keep travel distances realistic.
- Prioritize places close to the route.
- Make the itinerary suitable for a road trip.
- Do not invent exact hotel prices.
- Do not invent exact ticket prices.
- Keep recommendations practical.
- Keep the response easy to read.
- Do not use Markdown.
- Return ONLY HTML fragments.

Allowed HTML tags:

<h3>
<h4>
<p>
<ul>
<li>
<strong>

Do not return:

<html>
<head>
<body>
<markdown>
\`\`\`
`;


        // -------------------------------
        // Gemini request
        // -------------------------------

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY
                },

                body: JSON.stringify({

                    contents: [

                        {
                            role: "user",

                            parts: [

                                {
                                    text: prompt
                                }

                            ]

                        }

                    ],

                    generationConfig: {

                        temperature: 0.7,

                        maxOutputTokens: 5000

                    }

                })

            }
        );


        const data =
            await response.json();


        console.log(
            "Roadly Gemini response:",
            data
        );


        // -------------------------------
        // Gemini API error
        // -------------------------------

        if (!response.ok) {

            const message =
                data?.error?.message ||
                `Gemini request failed (${response.status})`;

            return res.status(response.status).json({
                error: message
            });

        }


        // -------------------------------
        // Extract itinerary
        // -------------------------------

        const parts =
            data?.candidates?.[0]?.content?.parts;


        if (!parts || !parts.length) {

            return res.status(500).json({
                error: "Gemini returned no itinerary."
            });

        }


        const itinerary =
            parts
                .map(part => part.text || "")
                .join("")
                .trim();


        if (!itinerary) {

            return res.status(500).json({
                error: "Gemini returned an empty itinerary."
            });

        }


        // -------------------------------
        // Clean accidental code fences
        // -------------------------------

        const cleanedItinerary =
            itinerary
                .replace(/^```html\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .replace(/<\/?html[^>]*>/gi, "")
                .replace(/<\/?head[^>]*>/gi, "")
                .replace(/<\/?body[^>]*>/gi, "")
                .trim();


        // -------------------------------
        // SUCCESS
        // -------------------------------

        return res.status(200).json({

            itinerary: cleanedItinerary

        });

    }

    catch (error) {

        console.error(
            "Roadly AI server error:",
            error
        );

        return res.status(500).json({

            error:
                error.message ||
                "Unable to generate itinerary."

        });

    }

}
