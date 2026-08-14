// ======================================
// ROADLY - OPENROUTESERVICE PROXY
// ======================================

export default async function handler(req, res) {

    try {

        const { startLon, startLat, endLon, endLat } = req.query;

        if (
            startLon === undefined ||
            startLat === undefined ||
            endLon === undefined ||
            endLat === undefined
        ) {

            return res.status(400).json({
                error: "Start and destination coordinates are required."
            });

        }

        const apiKey =
            process.env.OPENROUTESERVICE_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                error: "OPENROUTESERVICE_API_KEY is not configured."
            });

        }

        const url =
            `https://api.openrouteservice.org/v2/directions/driving-car` +
            `?api_key=${encodeURIComponent(apiKey)}` +
            `&start=${encodeURIComponent(startLon)},${encodeURIComponent(startLat)}` +
            `&end=${encodeURIComponent(endLon)},${encodeURIComponent(endLat)}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "OpenRouteService error:",
                data
            );

            return res.status(response.status).json({
                error: "Route service failed.",
                details: data
            });

        }

        const route =
            data?.features?.[0];

        if (!route) {

            return res.status(404).json({
                error: "No route found."
            });

        }

        return res.status(200).json(route);

    }

    catch (error) {

        console.error(
            "Route API error:",
            error
        );

        return res.status(500).json({
            error: "Unable to calculate route."
        });

    }

}
