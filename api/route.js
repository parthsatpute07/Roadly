export default async function handler(req, res) {
    try {
        const {
            startLon,
            startLat,
            endLon,
            endLat
        } = req.query;

        if (
            !startLon ||
            !startLat ||
            !endLon ||
            !endLat
        ) {
            return res.status(400).json({
                error: "Start and destination coordinates are required."
            });
        }

        const apiKey =
            process.env.OPENROUTESERVICE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error:
                    "OPENROUTESERVICE_API_KEY is not configured in Vercel."
            });
        }

        const coordinates = [
            [
                Number(startLon),
                Number(startLat)
            ],
            [
                Number(endLon),
                Number(endLat)
            ]
        ];

        const response = await fetch(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
                method: "POST",

                headers: {
                    "Authorization": apiKey,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    coordinates
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "OpenRouteService:",
                data
            );

            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    data.message ||
                    "Unable to calculate route."
            });
        }

        return res.status(200).json(data);

    } catch (error) {

        console.error(
            "Route API:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Internal route server error."
        });
    }
}
