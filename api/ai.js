// ======================================
// ROADLY AI PLANNER
// ======================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ======================================
// GENERATE ITINERARY
// ======================================

async function generateItinerary(
    start,
    destination,
    days,
    budget,
    interests
) {

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"
    ) {
        throw new Error(
            "Gemini API key is missing."
        );
    }


    const prompt = `
You are Roadly AI, an expert road-trip planner.

Create a practical and exciting road trip itinerary.

Starting Point:
${start}

Destination:
${destination}

Trip Duration:
${days} days

Estimated Budget:
₹${budget}

Interests:
${interests}

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


    console.log("🚗 Roadly AI request starting...");


    const url =
        "https://generativelanguage.googleapis.com/v1beta/" +
        "models/gemini-2.5-flash:generateContent";


    try {

        const response = await fetch(
    "/api/itinerary",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            start,
            destination,
            days,
            budget,
            interests
        })
    }
);
    


        const data =
            await response.json();


        console.log(
            "🤖 Gemini response:",
            data
        );


        // ==================================
        // HTTP ERROR
        // ==================================

        if (!response.ok) {

            const message =
                data?.error?.message ||
                `Gemini request failed (${response.status})`;

            throw new Error(message);

        }


        // ==================================
        // API ERROR
        // ==================================

        if (data.error) {

            throw new Error(
                data.error.message
            );

        }


        // ==================================
        // RESPONSE CHECK
        // ==================================

        const parts =
            data?.candidates?.[0]?.content?.parts;


        if (!parts || !parts.length) {

            throw new Error(
                "Gemini returned no itinerary."
            );

        }


        const text =
            parts
                .map(part => part.text || "")
                .join("")
                .trim();


        if (!text) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        console.log(
            "✅ Roadly itinerary generated."
        );


        return cleanAIResponse(text);

    }

    catch (error) {

        console.error(
            "❌ Roadly AI Error:",
            error
        );

        throw error;

    }

}


// ======================================
// CLEAN AI RESPONSE
// ======================================

function cleanAIResponse(text) {

    let cleaned = text.trim();


    // Remove Markdown code fences
    cleaned = cleaned
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "");


    // Remove accidental HTML document wrappers
    cleaned = cleaned
        .replace(/<\/?html[^>]*>/gi, "")
        .replace(/<\/?head[^>]*>/gi, "")
        .replace(/<\/?body[^>]*>/gi, "");


    return cleaned.trim();

}
