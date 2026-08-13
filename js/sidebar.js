// ======================================
// ROADLY SIDEBAR NAVIGATION
// ======================================

const sidebarLinks =
    document.querySelectorAll(".sidebar-link");

const sections = [
    "dashboard",
    "route",
    "attractions",
    "hotels",
    "restaurants",
    "weather",
    "budget-section",
    "ai-planner",
    "saved-trips",
    "settings"
];


// --------------------------------------
// CLICK ACTIVE STATE
// --------------------------------------

sidebarLinks.forEach(link => {

    link.addEventListener("click", function () {

        sidebarLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});


// --------------------------------------
// ACTIVE SECTION WHILE SCROLLING
// --------------------------------------

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    const id = entry.target.id;

                    sidebarLinks.forEach(link => {

                        link.classList.remove("active");

                        if (
                            link.getAttribute("href") ===
                            "#" + id
                        ) {

                            link.classList.add("active");

                        }

                    });

                }

            });

        },
        {
            threshold: 0.25
        }
    );


// Observe dashboard sections

sections.forEach(id => {

    const section =
        document.getElementById(id);

    if (section) {

        observer.observe(section);

    }

});
