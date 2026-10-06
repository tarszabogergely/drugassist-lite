/*
=========================================
DrugAssist

Fájl:
review-ward.js

Feladata:
Az aktuális osztály gyógyszerészi
ellenőrzésre váró betegeinek
megjelenítése.

Megjeleníti azokat a betegeket,
akiknek a gyógyszerelése lezárásra
került (CHECKED státusz).

Fejlesztő:
Tarszabó Gergely + ChatGPT

Verzió:
1.0.0
=========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    loadWard
);

function loadWard() {

        const wardCode =
        Storage.loadCurrentWard();

    if (!wardCode) {

        alert("Nincs kiválasztott osztály.");

        window.location.href =
            "dashboard.html";

        return;

    }

    const wards =
        Storage.loadWards();

    const ward =
        wards.find(
            w => w.wardCode === wardCode
        );

    if (!ward) {

        alert("Az osztály nem található.");

        window.location.href =
            "dashboard.html";

        return;

    }

    renderWard(ward);

}

function renderWard(ward) {

    document.getElementById(
        "wardTitle"
    ).textContent =
        ward.wardName;

    const reviewPatients =
        ward.patients.filter(
            patient =>
                patient.status === CONFIG.status.CHECKED
        );

    document.getElementById(
        "patientCount"
    ).textContent =
        reviewPatients.length +
        " beteg vár ellenőrzésre";

    const container =
        document.getElementById(
            "patientContainer"
        );

    container.innerHTML = "";

    reviewPatients.forEach(patient => {

        const card =
            Render.createPatientCard(
                patient
            );

        card.onclick = () => {

            Storage.saveCurrentPatient(
                patient.patientId
            );

            location.href =
                "review.html";

        };

        container.appendChild(card);

    });

}
