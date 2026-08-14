// ======================================
// ROADLY DASHBOARD
// ======================================

const start = JSON.parse(localStorage.getItem("start"));
const destination = JSON.parse(localStorage.getItem("destination"));
const days = Number(localStorage.getItem("days") || 1);

const travelMode =
    localStorage.getItem("travelMode") ||
    localStorage.getItem("vehicle") ||
    "Car";

const travellers =
    JSON.parse(localStorage.getItem("travellers") || "{}");

const adults = Number(travellers.adults || 0);
const children = Number(travellers.children || 0);
const seniors = Number(travellers.seniors || 0);

const totalTravellers =
    adults + children + seniors || 1;


// ======================================
// CHECK TRIP DATA
// ======================================

if (!start || !destination) {
    alert("Trip information is missing.");
    window.location.href = "trip.html";
    throw new Error("Trip information missing.");
}


// ======================================
// HEADER
// ======================================

const startLocation =
    document.getElementById("startLocation");

const destinationLocation =
    document.getElementById("destinationLocation");

if (startLocation) {
    startLocation.textContent = `📍 ${start.address || "Starting Point"}`;
}

if (destinationLocation) {
    destinationLocation.textContent =
        `📍 ${destination.address || "Destination"}`;
}


// ======================================
// MAP
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
// START
// ======================================

loadDashboard();


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    console.log("Roadly dashboard started.");

    try {

        // ----------------------------------
        // ROUTE
        // ----------------------------------

        const routeUrl =
            `/api/route` +
            `?startLon=${encodeURIComponent(start.lon)}` +
            `&startLat=${encodeURIComponent(start.lat)}` +
            `&endLon=${encodeURIComponent(destination.lon)}` +
            `&endLat=${encodeURIComponent(destination.lat)}`;

        console.log("Route URL:", routeUrl);

        const routeResponse =
            await fetch(routeUrl);

        const routeData =
            await routeResponse.json();

        console.log("Route response:", routeData);

        if (!routeResponse.ok) {
            throw new Error(
                routeData.error ||
                "Route calculation failed."
            );
        }

        const route =
            routeData.features?.[0] || routeData;

        if (!route || !route.geometry) {
            throw new Error(
                "Invalid route data received."
            );
        }

        const totalBudget =
            drawRoute(route);


        // ----------------------------------
        // WEATHER
        // ----------------------------------

        await loadWeather();


        // ----------------------------------
        // ATTRACTIONS
        // ----------------------------------

        try {

            const places =
                await getTopPlaces(
                    destination.lat,
                    destination.lon
                );

            console.log(
                "Attractions:",
                places
            );

            renderPlaces(
                places || []
            );

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
                        <p>
                            Unable to load attractions.
                        </p>
                    </div>
                `;

            }

        }


        // ----------------------------------
        // AI
        // ----------------------------------

        await loadAI(
            totalBudget
        );

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        alert(
            "Unable to load your road trip: " +
            error.message
        );

    }

}


// ======================================
// DRAW ROUTE
// ======================================

function drawRoute(route) {

    const coordinates =
        route.geometry.coordinates;

    if (
        !coordinates ||
        coordinates.length === 0
    ) {
        throw new Error(
            "Route coordinates are missing."
        );
    }


    // ----------------------------------
    // ROUTE LINE
    // ----------------------------------

    const latLngs =
        coordinates.map(
            point => [
                point[1],
                point[0]
            ]
        );


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
            ${start.address || ""}
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
            ${destination.address || ""}
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


    // ==================================
    // ROUTE DETAILS
    // ==================================

    const properties =
        route.properties || {};

    const summary =
        properties.summary || {};

    const segment =
        properties.segments?.[0];


    let distance = 0;
    let duration = 0;


    if (summary.distance) {

        distance =
            summary.distance / 1000;

        duration =
            summary.duration / 3600;

    } else if (segment) {

        distance =
            segment.distance / 1000;

        duration =
            segment.duration / 3600;

    } else {

        throw new Error(
            "Route distance information is missing."
        );

    }


    const distanceText =
        distance.toFixed(1) + " km";

    const durationText =
        duration.toFixed(1) + " hrs";


    // ==================================
    // UPDATE CARDS
    // ==================================

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


    // ==================================
    // TRAVEL COST
    // ==================================

    let travelCost = 0;
    let costLabel = "⛽ Fuel Cost";


    if (travelMode === "Car") {

        const mileage = 15;
        const fuelPrice = 105;

        travelCost =
            Math.round(
                (distance / mileage) *
                fuelPrice
            );

        costLabel =
            "⛽ Fuel Cost";

    }

    else if (travelMode === "Bike") {

        const mileage = 40;
        const fuelPrice = 105;

        travelCost =
            Math.round(
                (distance / mileage) *
                fuelPrice
            );

        costLabel =
            "⛽ Fuel Cost";

    }

    else if (travelMode === "Bus") {

        const pricePerKm = 1.2;

        travelCost =
            Math.round(
                distance *
                pricePerKm *
                totalTravellers
            );

        costLabel =
            "🎫 Ticket Price";

    }

    else if (travelMode === "Train") {

        const pricePerKm = 1.5;

        travelCost =
            Math.round(
                distance *
                pricePerKm *
                totalTravellers
            );

        costLabel =
            "🎫 Ticket Price";

    }

    else if (travelMode === "Flight") {

        const pricePerKm = 5;

        travelCost =
            Math.round(
                distance *
                pricePerKm *
                totalTravellers
            );

        costLabel =
            "🎫 Ticket Price";

    }


    // ==================================
    // COST LABELS
    // ==================================

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


    // ==================================
    // COST
    // ==================================

    const costText =
        "₹ " +
        travelCost.toLocaleString("en-IN");

    setText(
        "fuelCost",
        costText
    );

    setText(
        "routeFuel",
        costText
    );


    // ==================================
    // TOTAL BUDGET
    // ==================================

    const hotelCost =
        days * 2500;

    const foodCost =
        days * 1200;

    const totalBudget =
        hotelCost +
        foodCost +
        travelCost;


    setText(
        "budget",
        "₹ " +
        totalBudget.toLocaleString("en-IN")
    );


    setText(
        "bestRoute",
        "Fastest Route"
    );


    return totalBudget;

}


// ======================================
// WEATHER
// ======================================

async function loadWeather() {

    try {

        const url =
            `/api/weather` +
            `?lat=${encodeURIComponent(destination.lat)}` +
            `&lon=${encodeURIComponent(destination.lon)}`;

        console.log(
            "Weather URL:",
            url
        );

        const response =
            await fetch(url);

        const data =
            await response.json();

        console.log(
            "Weather:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Weather request failed."
            );
        }

        displayWeather(data);

    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        setText(
            "weatherTemp",
            "--°C"
        );

        setText(
            "weatherCondition",
            "Weather unavailable"
        );

        setText(
            "humidity",
            "--"
        );

        setText(
            "wind",
            "--"
        );

    }

}


// ======================================
// DISPLAY WEATHER
// ======================================

function displayWeather(data) {

    if (!data) {
        return;
    }


    // Supports Open-Meteo format
    if (data.current) {

        const current =
            data.current;


        const temperature =
            current.temperature_2m;

        const humidity =
            current.relative_humidity_2m;

        const wind =
            current.wind_speed_10m;

        const code =
            current.weather_code;


        const info =
            getWeatherInfo(code);


        setText(
            "weatherTemp",
            Math.round(temperature) + "°C"
        );

        setText(
            "weatherCondition",
            info.description
        );

        setText(
            "weatherIcon",
            info.icon
        );

        setText(
            "humidity",
            humidity + "%"
        );

        setText(
            "wind",
            Math.round(wind) + " km/h"
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

}


// ======================================
// WEATHER INFO
// ======================================

function getWeatherInfo(code) {

    if (code === 0) {

        return {
            icon: "☀️",
            description: "Clear sky"
        };

    }

    if (code === 1 || code === 2) {

        return {
            icon: "🌤️",
            description: "Partly cloudy"
        };

    }

    if (code === 3) {

        return {
            icon: "☁️",
            description: "Cloudy"
        };

    }

    if (code === 45 || code === 48) {

        return {
            icon: "🌫️",
            description: "Foggy"
        };

    }

    if (
        code >= 51 &&
        code <= 57
    ) {

        return {
            icon: "🌦️",
            description: "Drizzle"
        };

    }

    if (
        code >= 61 &&
        code <= 67
    ) {

        return {
            icon: "🌧️",
            description: "Rain"
        };

    }

    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            icon: "❄️",
            description: "Snow"
        };

    }

    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            icon: "🌦️",
            description: "Rain showers"
        };

    }

    if (
        code >= 95 &&
        code <= 99
    ) {

        return {
            icon: "⛈️",
            description: "Thunderstorm"
        };

    }


    return {
        icon: "🌤️",
        description: "Weather"
    };

}


// ======================================
// WEATHER TIME
// ======================================

function formatWeatherTime(value) {

    return new Date(value)
        .toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

}


// ======================================
// AI ITINERARY
// ======================================

async function loadAI(totalBudget) {

    const aiPlan =
        document.getElementById(
            "aiPlan"
        );

    if (!aiPlan) {
        return;
    }


    aiPlan.innerHTML = `
        <div class="ai-loading">
            🤖 Creating your personalized itinerary...
        </div>
    `;


    try {

        if (
            typeof generateItinerary !==
            "function"
        ) {

            throw new Error(
                "AI planner is not available."
            );

        }


        const plan =
            await generateItinerary(
                start.address,
                destination.address,
                days,
                totalBudget,
                "Sightseeing, Food, Nature"
            );


        aiPlan.innerHTML =
            plan;

    } catch (error) {

        console.error(
            "AI error:",
            error
        );

        aiPlan.innerHTML = `
            <div class="ai-error">
                <h3>🤖 AI Planner</h3>
                <p>
                    AI itinerary is currently unavailable.
                </p>
            </div>
        `;

    }

}


// ======================================
// TEXT HELPER
// ======================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


// ======================================
// RENDER PLACES
// ======================================

function renderPlaces(places) {

    const container =
        document.getElementById(
            "placesContainer"
        );

    if (!container) {
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

            const p =
                place.properties || {};


            const name =
                p.name ||
                "Popular Attraction";


            const category =
                p.categories?.[0] ||
                "Tourist Attraction";


            const lat =
                Number(p.lat);


            const lon =
                Number(p.lon);


            const card =
                document.createElement(
                    "div"
                );


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
                    type="button"
                >
                    View
                </button>
            `;


            const button =
                card.querySelector(
                    ".place-btn"
                );


            button.addEventListener(
                "click",
                function () {

                    focusPlace(
                        lat,
                        lon
                    );

                }
            );


            container.appendChild(
                card
            );

        });

}


// ======================================
// FORMAT CATEGORY
// ======================================

function formatCategory(category) {

    return String(category)
        .replaceAll(".", " ")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


// ======================================
// FOCUS PLACE
// ======================================

function focusPlace(lat, lon) {

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
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
// GREETING
// ======================================

function updateGreeting() {

    const greeting =
        document.getElementById(
            "greeting"
        );

    if (!greeting) {
        return;
    }


    const hour =
        new Date().getHours();


    let message;


    if (
        hour >= 5 &&
        hour < 12
    ) {

        message =
            "Good Morning ☀️";

    }

    else if (
        hour >= 12 &&
        hour < 17
    ) {

        message =
            "Good Afternoon 🌤️";

    }

    else if (
        hour >= 17 &&
        hour < 21
    ) {

        message =
            "Good Evening 🌆";

    }

    else {

        message =
            "Good Night 🌙";

    }


    greeting.textContent =
        message;

}


updateGreeting();

setInterval(
    updateGreeting,
    60000
);
