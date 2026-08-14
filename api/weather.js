// ======================================
// ROADLY - WEATHER API
// ======================================

export default async function handler(req, res) {

    try {

        const { lat, lon } = req.query;

        if (
            lat === undefined ||
            lon === undefined
        ) {

            return res.status(400).json({
                error: "Latitude and longitude are required."
            });

        }

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${encodeURIComponent(lat)}` +
            `&longitude=${encodeURIComponent(lon)}` +
            `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
            `&daily=sunrise,sunset` +
            `&timezone=auto`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "Open-Meteo error:",
                data
            );

            return res.status(response.status).json({
                error: "Weather service failed.",
                details: data
            });

        }

        return res.status(200).json(data);

    }

    catch (error) {

        console.error(
            "Weather API error:",
            error
        );

        return res.status(500).json({
            error: "Unable to load weather."
        });

    }

}
