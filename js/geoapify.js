// =========================================
// ROADLY - GEOAPIFY SERVICE
// =========================================

// Convert place name to coordinates
async function getCoordinates(placeName) {

    const url =
    `/api/geocode?text=${encodeURIComponent(placeName)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
        return null;
    }

    return {
        lat: data.features[0].properties.lat,
        lon: data.features[0].properties.lon
    };

}

// Get famous attractions near destination
async function getTopPlaces(lat, lon) {

   const url =
`https://api.geoapify.com/v2/places?categories=
tourism.attraction,
tourism.sights,
entertainment,
natural,
catering.restaurant,
leisure.park
&filter=circle:${lon},${lat},30000
&bias=proximity:${lon},${lat}
&limit=20


    const response = await fetch(url);
    const data = await response.json();

    return data.features || [];

}
// =========================================
// DISPLAY TOP PLACES
// =========================================

function renderPlaces(places) {

    const container = document.getElementById("placesContainer");

    container.innerHTML = "";

    if (!places.length) {

        container.innerHTML = "<p>No attractions found nearby.</p>";

        return;

    }

    places.forEach(place => {

        const p = place.properties;

        container.innerHTML += `

        <div class="place-card">

            <div class="place-content">

                <h3>${p.name || "Unnamed Place"}</h3>

                <p>${p.formatted || ""}</p>

                    <small>
                    ${(p.categories?.[0] || "Attraction")
                    .replaceAll(".", " ")
                    .toUpperCase()}
                    </small>

                <br><br>

                <button onclick="focusPlace(${p.lat},${p.lon})">

                    📍 View on Map

                </button>

            </div>

        </div>

        `;

    });

}
