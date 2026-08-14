// ======================================
// ROADLY ROUTE SERVICE
// ======================================

async function getRoute(start, destination) {

    if (!start || !destination) {
        throw new Error("Start or destination is missing.");
    }

    const params = new URLSearchParams({
        startLon: start.lon,
        startLat: start.lat,
        endLon: destination.lon,
        endLat: destination.lat
    });

    const response = await fetch(
        `/api/route?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Route API request failed."
        );
    }

    // API returns FeatureCollection
    if (
        !data.features ||
        !data.features.length
    ) {
        throw new Error(
            "No route was found."
        );
    }

    // Return the actual route feature
    return data.features[0];
}
