/*
=========================================
DrugAssist

Fájl:
ward.js

Feladata:
Az aktuális osztály betegeinek megjelenítése.

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

    const activePatients =
    ward.patients.filter(
        patient =>
            patient.status !== CONFIG.status.CHECKED &&
            patient.status !== CONFIG.status.REVIEWED
    );

    document.getElementById(
        "patientCount"
    ).textContent =
        activePatients.length +
        " beteg vár gyógyszerelésre";

    const container =
        document.getElementById(
            "patientContainer"
        );

    container.innerHTML = "";

    activePatients.forEach(patient => {

        const card =
            Render.createPatientCard(
                patient
            );

        container.appendChild(card);

    });

    initWardPdf(ward);

}

/*
=====================================
Osztályos átadó PDF
=====================================
*/

function initWardPdf(ward) {

    const button =
        document.getElementById(
            "wardPdfButton"
        );

    if (!button) {

        return;

    }

    button.onclick = () => {

        WardReport.generate(ward);

    };

}