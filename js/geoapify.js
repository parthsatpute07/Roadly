// =========================================
// ROADLY - GEOAPIFY SERVICE
// =========================================

// =========================================
// Convert place name to coordinates
// =========================================

async function getCoordinates(placeName) {

    if (!placeName) {
        throw new Error("Place name is required.");
    }

    const params = new URLSearchParams({
        text: placeName,
        limit: "5"
    });

    const response = await fetch(
        `/api/geocode?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Location search failed."
        );
    }

    if (
        !data.features ||
        data.features.length === 0
    ) {
        return null;
    }

    const properties =
        data.features[0].properties;

    return {
        address:
            properties.formatted ||
            placeName,

        lat: properties.lat,
        lon: properties.lon
    };
}


// =========================================
// Get famous attractions near destination
// =========================================

async function getTopPlaces(lat, lon) {

    if (
        lat === undefined ||
        lon === undefined
    ) {
        throw new Error(
            "Destination coordinates are missing."
        );
    }

    const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon)
    });

    const response = await fetch(
        `/api/places?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to load attractions."
        );
    }

    return data.features || [];
}


// =========================================
// DISPLAY TOP PLACES
// =========================================

function renderPlaces(places) {

    const container =
        document.getElementById(
            "placesContainer"
        );

    if (!container) {
        console.error(
            "placesContainer not found."
        );

        return;
    }

    container.innerHTML = "";

    if (
        !places ||
        places.length === 0
    ) {

        container.innerHTML =
            "<p>No attractions found nearby.</p>";

        return;
    }

    places
        .slice(0, 8)
        .forEach(place => {

            const p =
                place.properties || {};

            const name =
                p.name ||
                "Unnamed Place";

            const formatted =
                p.formatted ||
                "Tourist attraction";

            const category =
                p.categories?.[0] ||
                "Attraction";

            const lat =
                p.lat;

            const lon =
                p.lon;

            container.innerHTML += `

                <div class="place-card">

                    <div class="place-content">

                        <h3>
                            ${name}
                        </h3>

                        <p>
                            ${formatted}
                        </p>

                        <small>
                            ${category
                                .replaceAll(".", " ")
                                .toUpperCase()}
                        </small>

                        <br><br>

                        <button
                            onclick="focusPlace(${lat}, ${lon})"
                        >
                            📍 View on Map
                        </button>

                    </div>

                </div>

            `;
        });
}
