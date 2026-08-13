const button = document.getElementById("saveBudget");

button.onclick = () => {

    const selected = document.querySelector(
        'input[name="budget"]:checked'
    );

    if (!selected) {

        alert("Please select a budget.");

        return;

    }

    localStorage.setItem(
        "budget",
        selected.value
    );

    window.location.href = "vehicle.html";

};
