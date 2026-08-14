// ======================================
// ROADLY DASHBOARD
// ======================================

// ---------- Load Trip ----------

const start = JSON.parse(localStorage.getItem("start"));
const destination = JSON.parse(localStorage.getItem("destination"));
const days = Number(localStorage.getItem("days") || 1);

// ======================================
// TRAVEL MODE & TRAVELLERS
// ======================================

const travelMode =
    localStorage.getItem("travelMode") ||
    localStorage.getItem("vehicle") ||
    "Car";

const travellers =
    JSON.parse(
        localStorage.getItem("travellers") || "{}"
    );

const adults =
    Number(travellers.adults || 0);

const children =
    Number(travellers.children || 0);

const seniors =
    Number(travellers.seniors || 0);

const totalTravellers =
    adults + children + seniors;

// ---------- Check Trip ----------

if (!start || !destination) {

    alert("Trip information is missing.");

    window.location.href = "trip.html";

    throw new Error("Trip information missing.");

}


// ======================================
// UPDATE HEADER
// ======================================

const startLocation = document.getElementById("startLocation");
const destinationLocation =
    document.getElementById("destinationLocation");

if (startLocation) {
    startLocation.textContent = `📍 ${start.address}`;
}

if (destinationLocation) {
    destinationLocation.textContent =
        `📍 ${destination.address}`;
}


// ======================================
// CREATE MAP
// ======================================

const map = L.map("map").setView(
    [destination.lat, destination.lon],
    8
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
    }
).addTo(map);


// ======================================
// START DASHBOARD
// ======================================

loadDashboard();

// ----------------------------------
// WEATHER
// ----------------------------------

try {

    const weatherResponse = await fetch(
        `/api/weather?lat=${encodeURIComponent(destination.lat)}` +
        `&lon=${encodeURIComponent(destination.lon)}`
    );

    const weatherData =
        await weatherResponse.json();

    if (!weatherResponse.ok) {
        throw new Error(
            weatherData.error || "Weather request failed."
        );
    }

    displayWeather(weatherData);

} catch (error) {

    console.error(
        "Weather error:",
        error
    );

    setText(
        "weatherCondition",
        "Weather unavailable"
    );
}

// ======================================
// LOAD EVERYTHING
// ======================================

async function loadDashboard() {

    try {

        // ----------------------------------
        // ROUTE
        // ----------------------------------

        const routeResponse = await fetch(
    `/api/route?startLon=${encodeURIComponent(start.lon)}` +
    `&startLat=${encodeURIComponent(start.lat)}` +
    `&endLon=${encodeURIComponent(destination.lon)}` +
    `&endLat=${encodeURIComponent(destination.lat)}`
    );

        const routeData = await routeResponse.json();

        if (!routeResponse.ok) {
        throw new Error(
        routeData.error || "Route calculation failed."
        );
        }

        const route = routeData;

        const totalBudget = drawRoute(route);


        // ----------------------------------
        // TOP ATTRACTIONS
        // ----------------------------------

        try {

            const places = await getTopPlaces(
                destination.lat,
                destination.lon
            );

            console.log("TOP PLACES:", places);

            renderPlaces(places);

        } catch (error) {

            console.error(
                "Attractions error:",
                error
            );

            const container =
                document.getElementById(
                    "placesContainer"
                );

            if (container) {

                container.innerHTML = `
                    <div class="empty-message">
                        <p>Unable to load attractions.</p>
                    </div>
                `;

            }

        }


        // ----------------------------------
        // AI ITINERARY
        // ----------------------------------

        const aiPlan =
            document.getElementById("aiPlan");

        if (aiPlan) {

            aiPlan.innerHTML = `
                <div class="ai-loading">
                    🤖 Creating your personalized itinerary...
                </div>
            `;

        }


        try {

            const plan =
                await generateItinerary(
                    start.address,
                    destination.address,
                    days,
                    totalBudget,
                    "Sightseeing, Food, Nature"
                );

            if (aiPlan) {

                aiPlan.innerHTML = plan;

            }

        } catch (error) {

            console.error(
                "AI itinerary error:",
                error
            );

            if (aiPlan) {

                aiPlan.innerHTML = `
                    <div class="ai-error">
                        <h3>🤖 AI Planner</h3>
                        <p>
                            We couldn't generate your itinerary
                            right now.
                        </p>
                        <small>
                            ${error.message}
                        </small>
                    </div>
                `;

            }

        }

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        alert(
            "Unable to load your road trip. Please try again."
        );

    }

}


// ======================================
// DRAW ROUTE
// ======================================

function drawRoute(route) {

    if (!route) {

        throw new Error(
            "Route data is missing."
        );

    }


    // ----------------------------------
    // ROUTE COORDINATES
    // ----------------------------------

    const coordinates =
        route.geometry.coordinates;

    const latLngs =
        coordinates.map(point => [
            point[1],
            point[0]
        ]);


    // ----------------------------------
    // DRAW ROUTE
    // ----------------------------------

    L.polyline(
        latLngs,
        {
            color: "#2563EB",
            weight: 6,
            opacity: 0.9
        }
    ).addTo(map);


    // ----------------------------------
    // START MARKER
    // ----------------------------------

    L.marker([
        start.lat,
        start.lon
    ])
        .addTo(map)
        .bindPopup(`
            <strong>Starting Point</strong><br>
            ${start.address}
        `);


    // ----------------------------------
    // DESTINATION MARKER
    // ----------------------------------

    L.marker([
        destination.lat,
        destination.lon
    ])
        .addTo(map)
        .bindPopup(`
            <strong>Destination</strong><br>
            ${destination.address}
        `);


    // ----------------------------------
    // FIT MAP
    // ----------------------------------

    map.fitBounds(
        latLngs,
        {
            padding: [40, 40]
        }
    );


    // ----------------------------------
    // ROUTE SUMMARY
    // ----------------------------------

    const summary =
        route.properties.summary;


    const distance =
        summary.distance / 1000;


    const duration =
        summary.duration / 3600;


    const distanceText =
        distance.toFixed(1) + " km";


    const durationText =
        duration.toFixed(1) + " hrs";


    // ----------------------------------
    // DASHBOARD CARDS
    // ----------------------------------

    setText(
        "distance",
        distanceText
    );

    setText(
        "travelTime",
        durationText
    );

    setText(
        "routeDistance",
        distanceText
    );

    setText(
        "routeTime",
        durationText
    );


    // ======================================
// TRAVEL COST
// ======================================

let travelCost = 0;

let costLabel = "";


// --------------------------------------
// CAR
// --------------------------------------

if (travelMode === "Car") {

    const mileage = 15;
    const fuelPrice = 105;

    travelCost = Math.round(
        (distance / mileage) * fuelPrice
    );

    costLabel = "⛽ Fuel Cost";

}


// --------------------------------------
// BIKE
// --------------------------------------

else if (travelMode === "Bike") {

    const mileage = 40;
    const fuelPrice = 105;

    travelCost = Math.round(
        (distance / mileage) * fuelPrice
    );

    costLabel = "⛽ Fuel Cost";

}


// --------------------------------------
// BUS
// --------------------------------------

else if (travelMode === "Bus") {

    const pricePerKm = 1.20;

    travelCost = Math.round(
        distance *
        pricePerKm *
        totalTravellers
    );

    costLabel = "🎫 Ticket Price";

}


// --------------------------------------
// TRAIN
// --------------------------------------

else if (travelMode === "Train") {

    const pricePerKm = 1.50;

    travelCost = Math.round(
        distance *
        pricePerKm *
        totalTravellers
    );

    costLabel = "🎫 Ticket Price";

}


// --------------------------------------
// FLIGHT
// --------------------------------------

else if (travelMode === "Flight") {

    const pricePerKm = 5;

    travelCost = Math.round(
        distance *
        pricePerKm *
        totalTravellers
    );

    costLabel = "🎫 Ticket Price";

}


// --------------------------------------
// UPDATE DASHBOARD LABELS
// --------------------------------------

const fuelCard =
    document.querySelector(
        ".summary-card:nth-child(3) h3"
    );

if (fuelCard) {

    fuelCard.textContent =
        costLabel;

}


const routeFuelCard =
    document.querySelector(
        ".route-box:nth-child(3) h4"
    );

if (routeFuelCard) {

    routeFuelCard.textContent =
        costLabel;

}


// --------------------------------------
// UPDATE COST
// --------------------------------------

setText(
    "fuelCost",
    "₹ " +
    travelCost.toLocaleString("en-IN")
);

setText(
    "routeFuel",
    "₹ " +
    travelCost.toLocaleString("en-IN")
);

    // ----------------------------------
    // BUDGET
    // ----------------------------------

    const hotel =
    days * 2500;

    const food =
    days * 1200;

    const total =
    hotel + food + travelCost;


    setText(
        "budget",
        "₹ " +
        total.toLocaleString("en-IN")
    );


    setText(
        "bestRoute",
        "Fastest Route"
    );


    return total;

}


// ======================================
// HELPER
// ======================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


// ======================================
// RENDER TOP PLACES
// ======================================

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

        container.innerHTML = `
            <div class="empty-message">
                <p>
                    No attractions found near
                    ${destination.address}.
                </p>
            </div>
        `;

        return;

    }


    places
        .slice(0, 8)
        .forEach(place => {

            const properties =
                place.properties || {};


            const name =
                properties.name ||
                "Popular Attraction";


            const category =
                properties.categories?.[0] ||
                "Tourist Attraction";


            const lat =
                properties.lat;


            const lon =
                properties.lon;


            const card =
                document.createElement("div");

            card.className =
                "place-card";


            card.innerHTML = `

                <div class="place-icon">
                    📍
                </div>

                <div class="place-info">

                    <h3>
                        ${name}
                    </h3>

                    <p>
                        ${formatCategory(category)}
                    </p>

                </div>

                <button
                    class="place-btn"
                    onclick="focusPlace(
                        ${lat},
                        ${lon}
                    )"
                >
                    View
                </button>

            `;


            container.appendChild(card);

        });

}


// ======================================
// FORMAT CATEGORY
// ======================================

function formatCategory(category) {

    return category
        .replaceAll(".", " ")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


// ======================================
// FOCUS PLACE ON MAP
// ======================================

function focusPlace(lat, lon) {

    if (
        typeof lat !== "number" ||
        typeof lon !== "number"
    ) {

        return;

    }


    map.setView(
        [lat, lon],
        16
    );


    L.marker([
        lat,
        lon
    ])
        .addTo(map)
        .bindPopup(
            "📍 Tourist Attraction"
        )
        .openPopup();

}
// ======================================
// DYNAMIC GREETING
// ======================================

function updateGreeting() {

    const greeting =
        document.getElementById("greeting");

    if (!greeting) return;

    const hour =
        new Date().getHours();

    let message;

    if (hour >= 5 && hour < 12) {

        message = "Good Morning ☀️";

    } else if (hour >= 12 && hour < 17) {

        message = "Good Afternoon 🌤️";

    } else if (hour >= 17 && hour < 21) {

        message = "Good Evening 🌆";

    } else {

        message = "Good Night 🌙";

    }

    greeting.textContent = message;
}


// Run immediately
updateGreeting();

// Update every minute
setInterval(
    updateGreeting,
    60000
);
// ======================================
// WEATHER DISPLAY
// ======================================

function displayWeather(data) {

    if (!data || !data.current) {
        return;
    }

    const current =
        data.current;

    const temperature =
        Math.round(current.temperature_2m);

    const humidity =
        current.relative_humidity_2m;

    const wind =
        Math.round(current.wind_speed_10m);

    const weatherCode =
        current.weather_code;

    const weatherInfo =
        getWeatherInfo(weatherCode);

    setText(
        "weatherTemp",
        `${temperature}°C`
    );

    setText(
        "temperature",
        `${temperature}°C`
    );

    setText(
        "weatherCondition",
        weatherInfo.description
    );

    setText(
        "weatherDescription",
        weatherInfo.description
    );

    setText(
        "weatherIcon",
        weatherInfo.icon
    );

    setText(
        "weatherEmoji",
        weatherInfo.icon
    );

    setText(
        "humidity",
        `${humidity}%`
    );

    setText(
        "weatherHumidity",
        `${humidity}%`
    );

    setText(
        "wind",
        `${wind} km/h`
    );

    setText(
        "windSpeed",
        `${wind} km/h`
    );

    if (
        data.daily &&
        data.daily.sunrise &&
        data.daily.sunset
    ) {

        setText(
            "sunrise",
            formatWeatherTime(
                data.daily.sunrise[0]
            )
        );

        setText(
            "sunset",
            formatWeatherTime(
                data.daily.sunset[0]
            )
        );
    }
}
// ======================================
// WEATHER CODES
// ======================================

function getWeatherInfo(code) {

    if (code === 0)
        return {
            icon: "☀️",
            description: "Clear sky"
        };

    if (code === 1 || code === 2)
        return {
            icon: "🌤️",
            description: "Partly cloudy"
        };

    if (code === 3)
        return {
            icon: "☁️",
            description: "Cloudy"
        };

    if (code === 45 || code === 48)
        return {
            icon: "🌫️",
            description: "Foggy"
        };

    if (code >= 51 && code <= 57)
        return {
            icon: "🌦️",
            description: "Drizzle"
        };

    if (code >= 61 && code <= 67)
        return {
            icon: "🌧️",
            description: "Rain"
        };

    if (code >= 71 && code <= 77)
        return {
            icon: "❄️",
            description: "Snow"
        };

    if (code >= 80 && code <= 82)
        return {
            icon: "🌦️",
            description: "Rain showers"
        };

    if (code >= 85 && code <= 86)
        return {
            icon: "🌨️",
            description: "Snow showers"
        };

    if (code >= 95 && code <= 99)
        return {
            icon: "⛈️",
            description: "Thunderstorm"
        };

    return {
        icon: "🌤️",
        description: "Weather"
    };
}


// ======================================
// WEATHER TIME
// ======================================

function formatWeatherTime(dateString) {

    return new Date(dateString)
        .toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
}
