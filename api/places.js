// ======================================
// ROADLY PLACES API
// ======================================

export default async function handler(req, res) {

    try {

        const { lat, lon } = req.query;

        if (
            lat === undefined ||
            lon === undefined
        ) {
            return res.status(400).json({
                error:
                    "Latitude and longitude are required."
            });
        }

        const apiKey =
            process.env.GEOAPIFY_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error:
                    "GEOAPIFY_API_KEY is not configured in Vercel."
            });
        }

        const categories = [
            "tourism.attraction",
            "tourism.sights",
            "entertainment",
            "natural",
            "catering.restaurant",
            "leisure.park"
        ].join(",");

        const params = new URLSearchParams({
            categories,
            filter: `circle:${lon},${lat},30000`,
            bias: `proximity:${lon},${lat}`,
            limit: "20",
            apiKey
        });

        const response = await fetch(
            `https://api.geoapify.com/v2/places?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(
                "Geoapify Places Error:",
                data
            );

            return res.status(response.status).json({
                error:
                    data.message ||
                    "Failed to load attractions."
            });
        }

        return res.status(200).json(data);

    } catch (error) {

        console.error(
            "Places API Error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Internal places server error."
        });
    }
}
