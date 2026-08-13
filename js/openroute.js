// ========================================
// GET ROUTE DETAILS
// ========================================

async function getRoute(start, destination) {

    const url =
`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${CONFIG.OPENROUTESERVICE_API_KEY}&start=${start.lon},${start.lat}&end=${destination.lon},${destination.lat}`;

    const response = await fetch(url);

    const data = await response.json();

    return data.features[0];

}
