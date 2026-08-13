// ======================================
// ROADLY - LIVE WEATHER
// ======================================

async function loadWeather() {

    try {

        const destination =
            JSON.parse(localStorage.getItem("destination"));

        if (!destination) {
            console.error("Destination not found.");
            return;
        }

        const lat = destination.lat;
        const lon = destination.lon;

        // Open-Meteo - FREE, NO API KEY
        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
            `&daily=sunrise,sunset` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed.");
        }

        const data = await response.json();

        console.log("Weather:", data);

        // --------------------------------------
        // CURRENT WEATHER
        // --------------------------------------

        const current = data.current;

        const temperature =
            Math.round(current.temperature_2m);

        const humidity =
            current.relative_humidity_2m;

        const wind =
            Math.round(current.wind_speed_10m);

        const weatherCode =
            current.weather_code;

        // --------------------------------------
        // WEATHER DESCRIPTION
        // --------------------------------------

        const weatherInfo =
            getWeatherInfo(weatherCode);

        // --------------------------------------
        // UPDATE WEATHER UI
        // --------------------------------------

        setWeatherText(
            ["weatherTemp", "temperature"],
            `${temperature}°C`
        );

        setWeatherText(
            ["weatherCondition", "weatherDescription"],
            weatherInfo.description
        );

        setWeatherText(
            ["weatherIcon", "weatherEmoji"],
            weatherInfo.icon
        );

        setWeatherText(
            ["humidity", "weatherHumidity"],
            `${humidity}%`
        );

        setWeatherText(
            ["wind", "windSpeed"],
            `${wind} km/h`
        );

        // --------------------------------------
        // SUNRISE / SUNSET
        // --------------------------------------

        if (
            data.daily &&
            data.daily.sunrise &&
            data.daily.sunset
        ) {

            const sunrise =
                formatTime(data.daily.sunrise[0]);

            const sunset =
                formatTime(data.daily.sunset[0]);

            setWeatherText(
                ["sunrise"],
                sunrise
            );

            setWeatherText(
                ["sunset"],
                sunset
            );
        }

    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        setWeatherText(
            ["weatherCondition", "weatherDescription"],
            "Weather unavailable"
        );
    }
}


// ======================================
// WEATHER CODES
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

    if (
        code === 45 ||
        code === 48
    ) {
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
        code >= 85 &&
        code <= 86
    ) {
        return {
            icon: "🌨️",
            description: "Snow showers"
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
// FORMAT TIME
// ======================================

function formatTime(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ======================================
// UPDATE ELEMENT SAFELY
// ======================================

function setWeatherText(ids, value) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent = value;

            return;
        }
    }
}


// ======================================
// START WEATHER
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadWeather();

    }
);
