const button = document.getElementById("saveTravellers");

button.onclick = () => {

    const adults = Number(
        document.getElementById("adults").value
    );

    const children = Number(
        document.getElementById("children").value
    );

    const seniors = Number(
        document.getElementById("seniors").value
    );

    const tripType = document.querySelector(
        'input[name="tripType"]:checked'
    );

    if (!tripType) {

        alert("Please choose a trip type.");

        return;

    }

    const travellers = {

        adults,
        children,
        seniors,

        type: tripType.value

    };

    localStorage.setItem(
        "travellers",
        JSON.stringify(travellers)
    );

    window.location.href = "loading.html";

};
