async function getRoute(start, destination) {

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

    return data;
}
