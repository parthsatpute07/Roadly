// ======================================
// ROADLY ROUTE SERVICE
// ======================================

async function getRoute(start, destination) {

    if (!start || !destination) {
        throw new Error("Start or destination is missing.");
    }

    const url =
        `/api/route` +
        `?startLon=${encodeURIComponent(start.lon)}` +
        `&startLat=${encodeURIComponent(start.lat)}` +
        `&endLon=${encodeURIComponent(destination.lon)}` +
        `&endLat=${encodeURIComponent(destination.lat)}`;

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.error ||
            "Unable to calculate route."
        );

    }

    return data;
}
