// ======================================
// ROADLY TRIP PAGE
// ======================================

let startLocation = null;
let destinationLocation = null;


// ======================================
// SEARCH GEOAPIFY
// ======================================

async function searchPlace(query) {

    if (query.length < 3) {
        return [];
    }

    const params = new URLSearchParams({
        text: query,
        limit: "5"
    });

    const response = await fetch(
        `/api/geocode?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.error ||
            "Location search failed."
        );
    }

    return data.features || [];
}


// ======================================
// BUILD AUTOCOMPLETE
// ======================================

function setupAutocomplete(inputId, resultId, callback) {

    const input = document.getElementById(inputId);
    const results = document.getElementById(resultId);

    if (!input || !results) {
        console.error(
            `Missing element: ${inputId} or ${resultId}`
        );
        return;
    }

    input.addEventListener("input", async () => {

        // User is typing again, so previous
        // selection is no longer guaranteed.
        callback(null);

        const query = input.value.trim();

        if (query.length < 3) {

            results.innerHTML = "";
            results.style.display = "none";

            return;
        }

        try {

            const places = await searchPlace(query);

            results.innerHTML = "";

            if (!places.length) {

                results.style.display = "none";

                return;
            }

            results.style.display = "block";

            places.forEach(place => {

                const div =
                    document.createElement("div");

                div.className = "search-item";

                div.textContent =
                    `📍 ${place.properties.formatted}`;

                div.onclick = () => {

                    const location = {

                        address:
                            place.properties.formatted,

                        lat:
                            place.properties.lat,

                        lon:
                            place.properties.lon

                    };

                    input.value =
                        location.address;

                    results.style.display =
                        "none";

                    callback(location);

                };

                results.appendChild(div);

            });

        } catch (error) {

            console.error(
                "Location search error:",
                error
            );

            results.innerHTML = "";

            results.style.display = "none";

        }

    });

}


// ======================================
// START LOCATION
// ======================================

setupAutocomplete(

    "start",

    "startResults",

    location => {

        startLocation = location;

    }

);


// ======================================
// DESTINATION
// ======================================

setupAutocomplete(

    "destination",

    "destinationResults",

    location => {

        destinationLocation = location;

    }

);


// ======================================
// RESOLVE LOCATION AUTOMATICALLY
// ======================================

async function resolveLocation(
    inputId,
    currentLocation
) {

    // If user already selected a suggestion,
    // use that location.
    if (currentLocation) {
        return currentLocation;
    }

    const input =
        document.getElementById(inputId);

    if (!input) {
        return null;
    }

    const query =
        input.value.trim();

    if (query.length < 3) {
        return null;
    }

    const places =
        await searchPlace(query);

    if (!places.length) {
        return null;
    }

    const place =
        places[0];

    return {

        address:
            place.properties.formatted,

        lat:
            place.properties.lat,

        lon:
            place.properties.lon

    };

}


// ======================================
// CONTINUE
// ======================================

const continueButton =
    document.getElementById("continueTrip");


if (continueButton) {

    continueButton.addEventListener(
        "click",
        async () => {

            const days =
                document.getElementById("days").value;


            // ----------------------------------
            // VALIDATE DAYS
            // ----------------------------------

            if (!days || Number(days) < 1) {

                alert(
                    "Please enter the number of days."
                );

                return;

            }


            // ----------------------------------
            // SHOW LOADING
            // ----------------------------------

            const originalText =
                continueButton.textContent;

            continueButton.disabled = true;

            continueButton.textContent =
                "Finding locations...";


            try {

                // ----------------------------------
                // AUTOMATICALLY RESOLVE LOCATIONS
                // ----------------------------------

                startLocation =
                    await resolveLocation(
                        "start",
                        startLocation
                    );

                destinationLocation =
                    await resolveLocation(
                        "destination",
                        destinationLocation
                    );


                // ----------------------------------
                // CHECK LOCATIONS
                // ----------------------------------

                if (!startLocation) {

                    alert(
                        "Please enter a valid starting location."
                    );

                    return;

                }

                if (!destinationLocation) {

                    alert(
                        "Please enter a valid destination."
                    );

                    return;

                }


                // ----------------------------------
                // SAVE TRIP
                // ----------------------------------

                localStorage.setItem(
                    "start",
                    JSON.stringify(startLocation)
                );

                localStorage.setItem(
                    "destination",
                    JSON.stringify(destinationLocation)
                );

                localStorage.setItem(
                    "days",
                    days
                );


                // ----------------------------------
                // NEXT PAGE
                // ----------------------------------

                window.location.href =
                    "/pages/interests.html";

            }

            catch (error) {

    console.error(
        "Trip setup error:",
        error
    );

    alert(
        "Trip setup error: " + error.message
    );

}

            finally {

                continueButton.disabled = false;

                continueButton.textContent =
                    originalText;

            }

        }
    );

}
