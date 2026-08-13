const button = document.getElementById("saveVehicle");

button.onclick = () => {

    const selected = document.querySelector(
        'input[name="vehicle"]:checked'
    );

    if (!selected) {

        alert("Please select a vehicle.");

        return;

    }

    // Save vehicle for existing system
    localStorage.setItem(
        "vehicle",
        selected.value
    );

    // Save travel mode for dashboard cost calculation
    localStorage.setItem(
        "travelMode",
        selected.value
    );

    // Keep your existing page flow
    window.location.href = "travellers.html";

};
