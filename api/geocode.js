// ======================================
// ROADLY GEOAPIFY PROXY
// ======================================

export default async function handler(req, res) {

    try {

        const query = req.query.text;

        if (!query || query.length < 3) {

            return res.status(400).json({
                error: "Search query is required."
            });

        }

        const apiKey =
            process.env.GEOAPIFY_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                error: "GEOAPIFY_API_KEY is not configured."
            });

        }

        const url =
            `https://api.geoapify.com/v1/geocode/autocomplete` +
            `?text=${encodeURIComponent(query)}` +
            `&limit=5` +
            `&apiKey=${apiKey}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (!response.ok) {

            return res.status(response.status).json({
                error: "Geoapify request failed.",
                details: data
            });

        }

        return res.status(200).json(data);

    }

    catch (error) {

        console.error(
            "Geoapify proxy error:",
            error
        );

        return res.status(500).json({
            error: "Location search failed."
        });

    }

}
